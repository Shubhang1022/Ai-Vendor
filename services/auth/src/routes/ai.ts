import express from 'express'
import { aiEngine } from '../services/ai-engine'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Apply authentication middleware to all AI routes
router.use(authenticateToken)

// Pricing optimization endpoint
router.post('/pricing/optimize', async (req, res) => {
  try {
    const { productData } = req.body
    
    if (!productData) {
      return res.status(400).json({ error: 'Product data is required' })
    }

    const optimization = await aiEngine.optimizePricing(productData)
    res.json(optimization)
  } catch (error) {
    console.error('Pricing optimization error:', error)
    res.status(500).json({ error: 'Failed to optimize pricing' })
  }
})

// Demand forecasting endpoint
router.post('/inventory/forecast', async (req, res) => {
  try {
    const { inventoryItem } = req.body
    
    if (!inventoryItem) {
      return res.status(400).json({ error: 'Inventory item data is required' })
    }

    const forecast = await aiEngine.forecastDemand(inventoryItem)
    res.json(forecast)
  } catch (error) {
    console.error('Demand forecasting error:', error)
    res.status(500).json({ error: 'Failed to forecast demand' })
  }
})

// Competitor price scraping endpoint
router.get('/pricing/competitors/:productName', async (req, res) => {
  try {
    const { productName } = req.params
    
    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' })
    }

    const competitors = await aiEngine.scrapeCompetitorPrices(productName)
    res.json(competitors)
  } catch (error) {
    console.error('Competitor scraping error:', error)
    res.status(500).json({ error: 'Failed to scrape competitor prices' })
  }
})

// Market sentiment analysis endpoint
router.get('/market/sentiment/:category', async (req, res) => {
  try {
    const { category } = req.params
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' })
    }

    const sentiment = await aiEngine.analyzeMarketSentiment(category)
    res.json(sentiment)
  } catch (error) {
    console.error('Market sentiment analysis error:', error)
    res.status(500).json({ error: 'Failed to analyze market sentiment' })
  }
})

// Admin AI endpoints
router.post('/admin/security-audit', async (req, res) => {
  try {
    const auditResults = await aiEngine.performSecurityAudit()
    
    // Return in ApiResponse format
    res.json({
      success: true,
      data: auditResults,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Security audit error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to perform security audit',
      timestamp: new Date().toISOString()
    })
  }
})

router.post('/admin/analytics-report', async (req, res) => {
  try {
    console.log('Analytics report request received:', req.body)
    const { period, reportType } = req.body
    const analyticsReport = await aiEngine.generateAnalyticsReport(period, reportType)
    console.log('Analytics report generated successfully')
    
    // Return in ApiResponse format
    res.json({
      success: true,
      data: analyticsReport,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Analytics report error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate analytics report',
      timestamp: new Date().toISOString()
    })
  }
})

router.post('/admin/database-backup', async (req, res) => {
  try {
    const { backupType } = req.body
    const backupResult = await aiEngine.performDatabaseBackup(backupType)
    
    // Return in ApiResponse format
    res.json({
      success: true,
      data: backupResult,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database backup error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to perform database backup',
      timestamp: new Date().toISOString()
    })
  }
})

// Vendor AI endpoints
router.post('/vendor/listing-optimization', async (req, res) => {
  try {
    console.log('Listing optimization request received:', req.body)
    const { listingData } = req.body
    const optimization = await aiEngine.optimizeListing(listingData)
    console.log('Listing optimization completed successfully')
    
    // Return in ApiResponse format
    res.json({
      success: true,
      data: optimization,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Listing optimization error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to optimize listing',
      timestamp: new Date().toISOString()
    })
  }
})

export default router