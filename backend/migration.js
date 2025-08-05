// migration.js
require('dotenv').config(); // Add this line at the top!

const mongoose = require('mongoose');
const { StockData, Watchlist } = require('./models/Stock');

const migrateDatabase = async () => {
  try {
    console.log('Starting database migration...');
    
    // Debug: Check if MongoDB URI is loaded
    console.log('MongoDB URI loaded:', process.env.MONGODB_URI ? 'YES' : 'NO');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Add default values for new fields in StockData (only for documents that don't have these fields)
    const stockUpdates = [
      { field: 'high', value: 0 },
      { field: 'low', value: 0 },
      { field: 'open', value: 0 },
      { field: 'previousClose', value: 0 },
      { field: 'eps', value: 0 },
      { field: 'dividend', value: 0 },
      { field: 'dividendYield', value: 0 },
      { field: 'beta', value: 0 },
      { field: 'high52Week', value: 0 },
      { field: 'low52Week', value: 0 },
      { field: 'sector', value: '' },
      { field: 'industry', value: '' },
      { field: 'exchange', value: '' },
      { field: 'currency', value: 'USD' }
    ];

    let totalStockUpdates = 0;
    for (const update of stockUpdates) {
      const filter = {};
      filter[update.field] = { $exists: false };
      
      const setOperation = {};
      setOperation[update.field] = update.value;
      
      const result = await StockData.updateMany(filter, { $set: setOperation });
      totalStockUpdates += result.modifiedCount;
      console.log(`Set default ${update.field} for ${result.modifiedCount} stock records`);
    }

    console.log(`Total stock record updates: ${totalStockUpdates}`);

    // Add default values for new fields in Watchlist
    const watchlistUpdates = [
      { field: 'name', value: 'My Watchlist' },
      { field: 'isDefault', value: true },
      { field: 'color', value: '#3B82F6' }
    ];

    let totalWatchlistUpdates = 0;
    for (const update of watchlistUpdates) {
      const filter = {};
      filter[update.field] = { $exists: false };
      
      const setOperation = {};
      setOperation[update.field] = update.value;
      
      const result = await Watchlist.updateMany(filter, { $set: setOperation });
      totalWatchlistUpdates += result.modifiedCount;
      console.log(`Set default ${update.field} for ${result.modifiedCount} watchlist records`);
    }

    console.log(`Total watchlist record updates: ${totalWatchlistUpdates}`);

    // Update watchlist stocks with new fields
    const watchlists = await Watchlist.find({});
    let stocksUpdated = 0;

    for (const watchlist of watchlists) {
      let modified = false;
      
      for (const stock of watchlist.stocks) {
        if (!stock.notes) {
          stock.notes = '';
          modified = true;
        }
        if (!stock.tags) {
          stock.tags = [];
          modified = true;
        }
        if (!stock.priceWhenAdded) {
          stock.priceWhenAdded = 0;
          modified = true;
        }
      }
      
      if (modified) {
        await watchlist.save();
        stocksUpdated++;
      }
    }

    console.log(`Updated stocks in ${stocksUpdated} watchlists`);

    // Create indexes
    console.log('Creating indexes...');
    
    await StockData.collection.createIndex({ symbol: 1 }, { unique: true });
    await StockData.collection.createIndex({ lastUpdated: -1 });
    await StockData.collection.createIndex({ symbol: 1, lastUpdated: -1 });
    
    await Watchlist.collection.createIndex({ userId: 1 });
    await Watchlist.collection.createIndex({ userId: 1, isDefault: -1 });

    console.log('Indexes created successfully');

    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase };