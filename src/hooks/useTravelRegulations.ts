import { useState, useEffect } from 'react';
import { travelRegulationService, type TravelRegulation } from '../lib/database';
import { useSupabaseAuth } from './useSupabaseAuth';

export function useTravelRegulations() {
  const { user, profile } = useSupabaseAuth();
  const [regulations, setRegulations] = useState<TravelRegulation[]>([]);
  const [activeRegulation, setActiveRegulation] = useState<TravelRegulation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && profile?.company_name) {
      loadRegulations();
      loadActiveRegulation();
    }
  }, [user, profile]);

  const loadRegulations = async () => {
    if (!profile?.company_name) return;
    
    setLoading(true);
    try {
      const data = await travelRegulationService.getRegulations(profile.company_name);
      setRegulations(data);
    } catch (error) {
      console.error('Error loading travel regulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveRegulation = async () => {
    if (!profile?.company_name) return;
    
    try {
      const data = await travelRegulationService.getActiveRegulation(profile.company_name);
      setActiveRegulation(data);
    } catch (error) {
      console.error('Error loading active regulation:', error);
    }
  };

  const createRegulation = async (regulationData: {
    company_name: string;
    version: string;
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
  }) => {
    if (!user || !profile) {
      return { success: false, error: 'ユーザーが認証されていません' };
    }

    setLoading(true);
    try {
      const result = await travelRegulationService.createRegulation({
        ...regulationData,
        company_id: user.id,
        status: 'draft',
        created_by: user.id
      });

      if (result.success) {
        await loadRegulations();
      }

      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const getAllowanceForPosition = (position: string): { domestic: number; overseas: number } => {
    if (!activeRegulation) {
      return { domestic: 5000, overseas: 7500 }; // デフォルト値
    }

    const positionKey = position.includes('役員') || position.includes('代表') ? 'executive' :
                       position.includes('部長') || position.includes('管理') ? 'manager' : 'general';

    return {
      domestic: activeRegulation.domestic_allowance[positionKey] || 5000,
      overseas: activeRegulation.overseas_allowance[positionKey] || 7500
    };
  };

  return {
    regulations,
    activeRegulation,
    loading,
    createRegulation,
    getAllowanceForPosition,
    refreshRegulations: loadRegulations
  };
}