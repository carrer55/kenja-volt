import { supabase } from './supabase';

// ユーザープロフィール関連
export interface UserProfile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  position: string | null;
  phone: string | null;
  department: string | null;
  role: 'user' | 'approver' | 'admin';
  created_at: string;
  updated_at: string;
}

// 出張申請関連
export interface BusinessTripApplication {
  id: string;
  user_id: string;
  title: string;
  purpose: string;
  destination: string;
  start_date: string;
  end_date: string;
  estimated_daily_allowance: number;
  estimated_transportation: number;
  estimated_accommodation: number;
  estimated_total: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'returned';
  submitted_at: string | null;
  approved_at: string | null;
  approver_id: string | null;
  approval_comment: string | null;
  created_at: string;
  updated_at: string;
}

// 経費申請関連
export interface ExpenseApplication {
  id: string;
  user_id: string;
  title: string;
  total_amount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'returned';
  submitted_at: string | null;
  approved_at: string | null;
  approver_id: string | null;
  approval_comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseItem {
  id: string;
  expense_application_id: string;
  category: '交通費' | '宿泊費' | '日当' | '雑費';
  date: string;
  amount: number;
  description: string;
  receipt_url: string | null;
  ocr_data: any;
  created_at: string;
}

// 出張規程関連
export interface TravelRegulation {
  id: string;
  company_id: string;
  company_name: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  regulation_data: any;
  domestic_allowance: {
    executive: number;
    manager: number;
    general: number;
  };
  overseas_allowance: {
    executive: number;
    manager: number;
    general: number;
  };
  distance_threshold: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// 書類管理関連
export interface Document {
  id: string;
  user_id: string;
  title: string;
  type: 'business-report' | 'allowance-detail' | 'expense-settlement' | 'travel-detail' | 'gps-log' | 'monthly-report' | 'annual-report';
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  content_data: any;
  file_url: string | null;
  file_size: string | null;
  created_at: string;
  updated_at: string;
}

// 通知関連
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'email' | 'push';
  category: 'approval' | 'reminder' | 'system' | 'update';
  read: boolean;
  related_application_id: string | null;
  created_at: string;
}

// ユーザープロフィール操作
export const userProfileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  },

  async createProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('user_profiles')
      .insert([profile]);
    
    if (error) {
      console.error('Error creating profile:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  }
};

// 出張申請操作
export const businessTripService = {
  async getApplications(userId: string): Promise<BusinessTripApplication[]> {
    const { data, error } = await supabase
      .from('business_trip_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching business trip applications:', error);
      return [];
    }
    
    return data || [];
  },

  async createApplication(application: Omit<BusinessTripApplication, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string; data?: BusinessTripApplication }> {
    const { data, error } = await supabase
      .from('business_trip_applications')
      .insert([application])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating business trip application:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  },

  async updateApplication(id: string, updates: Partial<BusinessTripApplication>): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('business_trip_applications')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating business trip application:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  },

  async getPendingApplicationsForApprover(approverId: string): Promise<BusinessTripApplication[]> {
    const { data, error } = await supabase
      .from('business_trip_applications')
      .select('*')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching pending applications:', error);
      return [];
    }
    
    return data || [];
  }
};

// 経費申請操作
export const expenseService = {
  async getApplications(userId: string): Promise<ExpenseApplication[]> {
    const { data, error } = await supabase
      .from('expense_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching expense applications:', error);
      return [];
    }
    
    return data || [];
  },

  async createApplication(application: Omit<ExpenseApplication, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string; data?: ExpenseApplication }> {
    const { data, error } = await supabase
      .from('expense_applications')
      .insert([application])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating expense application:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  },

  async getExpenseItems(applicationId: string): Promise<ExpenseItem[]> {
    const { data, error } = await supabase
      .from('expense_items')
      .select('*')
      .eq('expense_application_id', applicationId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching expense items:', error);
      return [];
    }
    
    return data || [];
  },

  async createExpenseItems(items: Omit<ExpenseItem, 'id' | 'created_at'>[]): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('expense_items')
      .insert(items);
    
    if (error) {
      console.error('Error creating expense items:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  }
};

// 出張規程操作
export const travelRegulationService = {
  async getRegulations(companyName: string): Promise<TravelRegulation[]> {
    const { data, error } = await supabase
      .from('travel_regulations')
      .select('*')
      .eq('company_name', companyName)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching travel regulations:', error);
      return [];
    }
    
    return data || [];
  },

  async createRegulation(regulation: Omit<TravelRegulation, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string; data?: TravelRegulation }> {
    const { data, error } = await supabase
      .from('travel_regulations')
      .insert([regulation])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating travel regulation:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  },

  async getActiveRegulation(companyName: string): Promise<TravelRegulation | null> {
    const { data, error } = await supabase
      .from('travel_regulations')
      .select('*')
      .eq('company_name', companyName)
      .eq('status', 'active')
      .single();
    
    if (error) {
      console.error('Error fetching active regulation:', error);
      return null;
    }
    
    return data;
  }
};

// 書類管理操作
export const documentService = {
  async getDocuments(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
    
    return data || [];
  },

  async createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string; data?: Document }> {
    const { data, error } = await supabase
      .from('documents')
      .insert([document])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating document:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  }
};

// 通知操作
export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data || [];
  },

  async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  },

  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('notifications')
      .insert([notification]);
    
    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  }
};

// 統計データ取得
export const analyticsService = {
  async getMonthlyStats(userId: string, year: number, month: number) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

    // 出張申請統計
    const { data: businessTripStats } = await supabase
      .from('business_trip_applications')
      .select('estimated_total')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .gte('start_date', startDate)
      .lte('end_date', endDate);

    // 経費申請統計
    const { data: expenseStats } = await supabase
      .from('expense_applications')
      .select('total_amount')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const totalBusinessTrip = businessTripStats?.reduce((sum, app) => sum + (app.estimated_total || 0), 0) || 0;
    const totalExpense = expenseStats?.reduce((sum, app) => sum + (app.total_amount || 0), 0) || 0;

    return {
      businessTripTotal: totalBusinessTrip,
      expenseTotal: totalExpense,
      grandTotal: totalBusinessTrip + totalExpense,
      businessTripCount: businessTripStats?.length || 0,
      expenseCount: expenseStats?.length || 0
    };
  }
};