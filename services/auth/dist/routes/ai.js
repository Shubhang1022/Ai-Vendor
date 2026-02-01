"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ai_engine_1 = require("../services/ai-engine");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply authentication middleware to all AI routes
router.use(auth_1.authenticateToken);
// Pricing optimization endpoint
router.post('/pricing/optimize', async (req, res) => {
    try {
        const { productData } = req.body;
        if (!productData) {
            return res.status(400).json({ error: 'Product data is required' });
        }
        const optimization = await ai_engine_1.aiEngine.optimizePricing(productData);
        res.json(optimization);
    }
    catch (error) {
        console.error('Pricing optimization error:', error);
        res.status(500).json({ error: 'Failed to optimize pricing' });
    }
});
// Demand forecasting endpoint
router.post('/inventory/forecast', async (req, res) => {
    try {
        const { inventoryItem } = req.body;
        if (!inventoryItem) {
            return res.status(400).json({ error: 'Inventory item data is required' });
        }
        const forecast = await ai_engine_1.aiEngine.forecastDemand(inventoryItem);
        res.json(forecast);
    }
    catch (error) {
        console.error('Demand forecasting error:', error);
        res.status(500).json({ error: 'Failed to forecast demand' });
    }
});
// Competitor price scraping endpoint
router.get('/pricing/competitors/:productName', async (req, res) => {
    try {
        const { productName } = req.params;
        if (!productName) {
            return res.status(400).json({ error: 'Product name is required' });
        }
        const competitors = await ai_engine_1.aiEngine.scrapeCompetitorPrices(productName);
        res.json(competitors);
    }
    catch (error) {
        console.error('Competitor scraping error:', error);
        res.status(500).json({ error: 'Failed to scrape competitor prices' });
    }
});
// Market sentiment analysis endpoint
router.get('/market/sentiment/:category', async (req, res) => {
    try {
        const { category } = req.params;
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }
        const sentiment = await ai_engine_1.aiEngine.analyzeMarketSentiment(category);
        res.json(sentiment);
    }
    catch (error) {
        console.error('Market sentiment analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze market sentiment' });
    }
});
// Admin AI endpoints
router.post('/admin/security-audit', async (req, res) => {
    try {
        const auditResults = await ai_engine_1.aiEngine.performSecurityAudit();
        // Return in ApiResponse format
        res.json({
            success: true,
            data: auditResults,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Security audit error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform security audit',
            timestamp: new Date().toISOString()
        });
    }
});
router.post('/admin/analytics-report', async (req, res) => {
    try {
        console.log('Analytics report request received:', req.body);
        const { period, reportType } = req.body;
        const analyticsReport = await ai_engine_1.aiEngine.generateAnalyticsReport(period, reportType);
        console.log('Analytics report generated successfully');
        // Return in ApiResponse format
        res.json({
            success: true,
            data: analyticsReport,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Analytics report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate analytics report',
            timestamp: new Date().toISOString()
        });
    }
});
router.post('/admin/database-backup', async (req, res) => {
    try {
        const { backupType } = req.body;
        const backupResult = await ai_engine_1.aiEngine.performDatabaseBackup(backupType);
        // Return in ApiResponse format
        res.json({
            success: true,
            data: backupResult,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Database backup error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform database backup',
            timestamp: new Date().toISOString()
        });
    }
});
// Vendor AI endpoints
router.post('/vendor/listing-optimization', async (req, res) => {
    try {
        console.log('Listing optimization request received:', req.body);
        const { listingData } = req.body;
        const optimization = await ai_engine_1.aiEngine.optimizeListing(listingData);
        console.log('Listing optimization completed successfully');
        // Return in ApiResponse format
        res.json({
            success: true,
            data: optimization,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Listing optimization error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to optimize listing',
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map