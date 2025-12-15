import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { PremiumFeature } from '../types';
import { useApp } from './AppContext';

interface PremiumContextType {
  isPremium: boolean;
  canAccess: (feature: PremiumFeature) => boolean;
  showUpgradePrompt: (feature: PremiumFeature) => void;
  hideUpgradePrompt: () => void;
  upgradeModalVisible: boolean;
  currentFeature: PremiumFeature | null;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { isPremium } = useApp();
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<PremiumFeature | null>(null);

  const canAccess = useCallback(
    (feature: PremiumFeature): boolean => {
      if (isPremium) return true;

      // Define which features are free
      const freeFeatures: PremiumFeature[] = [];
      return freeFeatures.includes(feature);
    },
    [isPremium]
  );

  const showUpgradePrompt = useCallback((feature: PremiumFeature) => {
    setCurrentFeature(feature);
    setUpgradeModalVisible(true);
  }, []);

  const hideUpgradePrompt = useCallback(() => {
    setUpgradeModalVisible(false);
    // Delay clearing feature so modal animation can complete
    setTimeout(() => setCurrentFeature(null), 300);
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        canAccess,
        showUpgradePrompt,
        hideUpgradePrompt,
        upgradeModalVisible,
        currentFeature,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}
