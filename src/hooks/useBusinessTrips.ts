import { useState, useEffect } from 'react';
import { businessTripService, type BusinessTripApplication } from '../lib/database';
import { useSupabaseAuth } from './useSupabaseAuth';

export function useBusinessTrips() {
  const { user } = useSupabaseAuth();
  const [applications, setApplications] = useState<BusinessTripApplication[]>([]);
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
      const data = await businessTripService.getApplications(user.id);
      setApplications(data);
    } catch (error) {
      console.error('Error loading business trip applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (applicationData: {
    title: string;
    purpose: string;
    destination: string;
    start_date: string;
    end_date: string;
    estimated_daily_allowance: number;
    estimated_transportation: number;
    estimated_accommodation: number;
    estimated_total: number;
  }) => {
    if (!user) {
      return { success: false, error: 'ユーザーが認証されていません' };
    }

    setLoading(true);
    try {
      const result = await businessTripService.createApplication({
        ...applicationData,
        user_id: user.id,
        status: 'draft',
        submitted_at: null,
        approved_at: null,
        approver_id: null,
        approval_comment: null
      });

      if (result.success && result.data) {
        setApplications(prev => [result.data!, ...prev]);
      }

      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (applicationId: string) => {
    setLoading(true);
    try {
      const result = await businessTripService.updateApplication(applicationId, {
        status: 'pending',
        submitted_at: new Date().toISOString()
      });

      if (result.success) {
        await loadApplications();
      }

      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (applicationId: string, updates: Partial<BusinessTripApplication>) => {
    setLoading(true);
    try {
      const result = await businessTripService.updateApplication(applicationId, updates);

      if (result.success) {
        await loadApplications();
      }

      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  return {
    applications,
    loading,
    createApplication,
    submitApplication,
    updateApplication,
    refreshApplications: loadApplications
  };
}