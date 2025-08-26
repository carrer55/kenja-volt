import { useState, useEffect } from 'react';
import { expenseService, type ExpenseApplication, type ExpenseItem } from '../lib/database';
import { useSupabaseAuth } from './useSupabaseAuth';

export function useExpenses() {
  const { user } = useSupabaseAuth();
  const [applications, setApplications] = useState<ExpenseApplication[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await expenseService.getApplications(user.id);
      setApplications(data);
    } catch (error) {
      console.error('Error loading expense applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (
    title: string,
    expenseItems: Array<{
      category: '交通費' | '宿泊費' | '日当' | '雑費';
      date: string;
      amount: number;
      description: string;
      receipt_url?: string;
      ocr_data?: any;
    }>
  ) => {
    if (!user) {
      return { success: false, error: 'ユーザーが認証されていません' };
    }

    setLoading(true);
    try {
      const totalAmount = expenseItems.reduce((sum, item) => sum + item.amount, 0);

      // 経費申請を作成
      const applicationResult = await expenseService.createApplication({
        user_id: user.id,
        title,
        total_amount: totalAmount,
        status: 'draft',
        submitted_at: null,
        approved_at: null,
        approver_id: null,
        approval_comment: null
      });

      if (!applicationResult.success || !applicationResult.data) {
        return applicationResult;
      }

      // 経費項目を作成
      const itemsToCreate = expenseItems.map(item => ({
        expense_application_id: applicationResult.data!.id,
        ...item
      }));

      const itemsResult = await expenseService.createExpenseItems(itemsToCreate);

      if (!itemsResult.success) {
        return itemsResult;
      }

      await loadApplications();
      return { success: true, data: applicationResult.data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const getExpenseItems = async (applicationId: string): Promise<ExpenseItem[]> => {
    try {
      return await expenseService.getExpenseItems(applicationId);
    } catch (error) {
      console.error('Error loading expense items:', error);
      return [];
    }
  };

  return {
    applications,
    loading,
    createApplication,
    getExpenseItems,
    refreshApplications: loadApplications
  };
}