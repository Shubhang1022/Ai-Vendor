interface InventoryItem {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    salesHistory: Array<{
        date: Date;
        quantity: number;
        price: number;
    }>;
}
declare class AIEngine {
    private priceHistory;
    private salesData;
    optimizePricing(productData: {
        name: string;
        currentPrice: number;
        category: string;
        salesHistory: Array<{
            date: Date;
            quantity: number;
            price: number;
        }>;
        competitorPrices: number[];
        marketTrend: string;
    }): Promise<{
        suggestedPrice: number;
        confidence: number;
        reasoning: string;
        priceElasticity: number;
    }>;
    forecastDemand(inventoryItem: InventoryItem): Promise<{
        predictedDemand: number;
        confidence: number;
        reorderRecommendation: string;
        riskLevel: 'low' | 'medium' | 'high';
    }>;
    scrapeCompetitorPrices(productName: string): Promise<Array<{
        supplier: string;
        price: number;
        rating: number;
        availability: string;
        source: string;
        aiScore: number;
    }>>;
    analyzeMarketSentiment(category: string): Promise<{
        sentiment: 'positive' | 'negative' | 'neutral';
        confidence: number;
        insights: string[];
        marketTrend: 'up' | 'down' | 'stable';
    }>;
    private calculatePriceElasticity;
    private calculateSeasonalFactor;
    private calculateCorrelation;
    private fallbackPricingAnalysis;
    private fallbackDemandAnalysis;
    private simulateWebScraping;
    private calculateSupplierAIScore;
    performSecurityAudit(): Promise<any>;
    private generateFallbackSecurityAudit;
    private getDefaultSecurityAnalysis;
    generateAnalyticsReport(period: string, reportType: string): Promise<any>;
    private generateFallbackAnalyticsReport;
    private getDefaultAnalyticsInsights;
    performDatabaseBackup(backupType: string): Promise<any>;
    optimizeListing(listingData: any): Promise<any>;
    private generateFallbackListingOptimization;
    private getDefaultListingAnalysis;
}
export declare const aiEngine: AIEngine;
export default aiEngine;
//# sourceMappingURL=ai-engine.d.ts.map