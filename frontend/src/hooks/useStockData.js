// src/hooks/useStockData.js - Updated Version
import { useState, useEffect, useCallback, useRef } from "react";
import { stockService } from "../services/stockService";
import socketClient from "../services/socketClient";

export const useStockData = () => {
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [stockData, setStockData] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [portfolioData, setPortfolioData] = useState([]);
  const [watchlistData, setWatchlistData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const stockUpdateSubscriptionRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Initialize socket connection and subscribe to updates
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isInitializedRef.current) {
      // Connect to socket
      socketClient.connect(token);

      // Subscribe to stock updates
      stockUpdateSubscriptionRef.current = socketClient.subscribeToStockUpdates(
        (data) => {
          console.log("Real-time stock update received:", data);

          // Update current quote if it matches selected stock
          if (data.symbol === selectedStock) {
            setCurrentQuote((prev) => ({
              ...prev,
              price: data.price,
              change: data.change,
              changePercent: data.changePercent,
              volume: data.volume,
              high: data.high,
              low: data.low,
              lastUpdate: new Date().toLocaleTimeString(),
            }));
          }

          // Update portfolio data
          setPortfolioData((prev) =>
            prev.map((stock) =>
              stock.symbol === data.symbol
                ? {
                    ...stock,
                    currentPrice: data.price,
                    change: data.changePercent,
                    lastUpdate: new Date().toLocaleTimeString(),
                  }
                : stock
            )
          );

          // Update watchlist data
          setWatchlistData((prev) =>
            prev.map((stock) =>
              stock.symbol === data.symbol
                ? {
                    ...stock,
                    currentPrice: data.price,
                    change: data.changePercent,
                    lastUpdate: new Date().toLocaleTimeString(),
                  }
                : stock
            )
          );
        }
      );

      isInitializedRef.current = true;
    }

    // Cleanup on unmount
    return () => {
      if (stockUpdateSubscriptionRef.current) {
        socketClient.unsubscribeFromStockUpdates(
          stockUpdateSubscriptionRef.current
        );
      }
    };
  }, [selectedStock]);

  // Join/leave stock-specific rooms when selected stock changes
  useEffect(() => {
    if (selectedStock && socketClient.getConnectionStatus().connected) {
      socketClient.joinStockRoom(selectedStock);

      return () => {
        socketClient.leaveStockRoom(selectedStock);
      };
    }
  }, [selectedStock]);

  // Fetch historical data for charts
  const fetchHistoricalData = useCallback(async (symbol, period = "1mo") => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      const response = await stockService.getHistoricalData(symbol, period);

      // Transform API response to chart format
      const chartData =
        response.data?.prices?.map((item) => ({
          date: new Date(item.date).toLocaleDateString(),
          price: parseFloat(item.close),
          volume: parseInt(item.volume),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          open: parseFloat(item.open),
        })) || [];

      setStockData(chartData);
    } catch (err) {
      console.error("Error fetching historical data:", err);
      setError(err.message);

      // Fallback to mock data if API fails
      const mockStockData = Array.from({ length: 30 }, (_, i) => {
        const basePrice = 150;
        const randomVariation = Math.random() * 20 - 10;
        const trendVariation = Math.sin(i / 5) * 5;
        const price = basePrice + randomVariation + trendVariation;

        return {
          date: new Date(
            Date.now() - (29 - i) * 24 * 60 * 60 * 1000
          ).toLocaleDateString(),
          price: Math.max(price, 50), // Ensure price doesn't go below $50
          volume: Math.floor(Math.random() * 1000000 + 500000),
          high: Math.max(price + Math.random() * 5, price),
          low: Math.max(price - Math.random() * 5, 50),
          open: Math.max(price + (Math.random() - 0.5) * 4, 50),
        };
      });
      setStockData(mockStockData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch current stock quote
  const fetchCurrentQuote = useCallback(async (symbol) => {
    if (!symbol) return;

    try {
      const response = await stockService.getStockQuote(symbol);
      const quote = response.data || response;

      setCurrentQuote({
        symbol: symbol,
        price: quote.price || quote.regularMarketPrice || 0,
        change: quote.change || quote.regularMarketChange || 0,
        changePercent:
          quote.changePercent || quote.regularMarketChangePercent || 0,
        volume: quote.volume || quote.regularMarketVolume || 0,
        high: quote.dayHigh || quote.regularMarketDayHigh || 0,
        low: quote.dayLow || quote.regularMarketDayLow || 0,
        open: quote.open || quote.regularMarketOpen || 0,
        previousClose:
          quote.previousClose || quote.regularMarketPreviousClose || 0,
        marketCap: quote.marketCap || 0,
        lastUpdate: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      console.error("Error fetching current quote:", err);

      // Fallback to mock quote
      const mockPrice = 150 + Math.random() * 50;
      const mockChange = (Math.random() - 0.5) * 10;

      setCurrentQuote({
        symbol: symbol,
        price: mockPrice,
        change: mockChange,
        changePercent: (mockChange / mockPrice) * 100,
        volume: Math.floor(Math.random() * 1000000 + 500000),
        high: mockPrice + Math.random() * 5,
        low: mockPrice - Math.random() * 5,
        open: mockPrice + (Math.random() - 0.5) * 4,
        lastUpdate: new Date().toLocaleTimeString(),
      });
    }
  }, []);

  // Fetch watchlist
  const fetchWatchlist = useCallback(async () => {
    try {
      const response = await stockService.getWatchlist();
      const watchlist = response.data?.stocks || [];

      if (watchlist.length > 0) {
        // Get current quotes for all watchlist stocks
        const symbols = watchlist.map((stock) => stock.symbol);

        try {
          const quotesResponse = await stockService.getMultipleQuotes(symbols);
          const quotes = quotesResponse.data || [];

          const watchlistWithQuotes = watchlist.map((stock) => {
            const quote = quotes.find((q) => q.symbol === stock.symbol);
            return {
              ...stock,
              currentPrice:
                quote?.price || stock.price || Math.random() * 200 + 50,
              change: quote?.changePercent || (Math.random() - 0.5) * 10,
              lastUpdate: new Date().toLocaleTimeString(),
            };
          });

          setWatchlistData(watchlistWithQuotes);

          // Set portfolio data (assuming watchlist items are also in portfolio)
          setPortfolioData(
            watchlistWithQuotes.map((stock) => ({
              ...stock,
              shares: stock.shares || Math.floor(Math.random() * 200 + 50), // Mock shares if not available
            }))
          );
        } catch (quoteError) {
          console.error("Error fetching quotes for watchlist:", quoteError);

          // Use watchlist data with mock prices
          const watchlistWithMockPrices = watchlist.map((stock) => ({
            ...stock,
            currentPrice: Math.random() * 200 + 50,
            change: (Math.random() - 0.5) * 10,
            lastUpdate: new Date().toLocaleTimeString(),
          }));

          setWatchlistData(watchlistWithMockPrices);
          setPortfolioData(
            watchlistWithMockPrices.map((stock) => ({
              ...stock,
              shares: Math.floor(Math.random() * 200 + 50),
            }))
          );
        }
      } else {
        // Set default watchlist if empty
        const defaultWatchlist = [
          { symbol: "AAPL", currentPrice: 165.5, change: 2.5 },
          { symbol: "GOOGL", currentPrice: 2750.0, change: -1.2 },
          { symbol: "MSFT", currentPrice: 380.25, change: 0.8 },
          { symbol: "TSLA", currentPrice: 245.67, change: 3.2 },
          { symbol: "AMZN", currentPrice: 3456.78, change: -0.5 },
        ].map((stock) => ({
          ...stock,
          lastUpdate: new Date().toLocaleTimeString(),
        }));

        setWatchlistData(defaultWatchlist);
        setPortfolioData(
          defaultWatchlist.map((stock) => ({
            ...stock,
            shares: Math.floor(Math.random() * 200 + 50),
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching watchlist:", err);

      // Fallback to mock portfolio data
      const mockPortfolio = [
        { symbol: "AAPL", shares: 100, currentPrice: 165.5, change: 2.5 },
        { symbol: "GOOGL", shares: 50, currentPrice: 2750.0, change: -1.2 },
        { symbol: "MSFT", shares: 75, currentPrice: 380.25, change: 0.8 },
      ].map((stock) => ({
        ...stock,
        lastUpdate: new Date().toLocaleTimeString(),
      }));

      setPortfolioData(mockPortfolio);
      setWatchlistData(mockPortfolio);
    }
  }, []);

  // Search stocks
  const searchStocks = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await stockService.searchStocks(query);
      setSearchResults(response.data || []);
    } catch (err) {
      console.error("Error searching stocks:", err);

      // Fallback mock search results
      const mockResults = [
        { symbol: "AAPL", name: "Apple Inc." },
        { symbol: "GOOGL", name: "Alphabet Inc." },
        { symbol: "MSFT", name: "Microsoft Corporation" },
        { symbol: "TSLA", name: "Tesla, Inc." },
        { symbol: "AMZN", name: "Amazon.com, Inc." },
      ].filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
    }
  }, []);

  // Add to watchlist
  const addToWatchlist = useCallback(
    async (symbol) => {
      try {
        await stockService.addToWatchlist(symbol);
        await fetchWatchlist(); // Refresh watchlist
        return { success: true };
      } catch (err) {
        console.error("Error adding to watchlist:", err);
        setError(err.message);
        return { success: false, error: err.message };
      }
    },
    [fetchWatchlist]
  );

  // Remove from watchlist
  const removeFromWatchlist = useCallback(
    async (symbol) => {
      try {
        await stockService.removeFromWatchlist(symbol);
        await fetchWatchlist(); // Refresh watchlist
        return { success: true };
      } catch (err) {
        console.error("Error removing from watchlist:", err);
        setError(err.message);
        return { success: false, error: err.message };
      }
    },
    [fetchWatchlist]
  );

  // Effect to fetch data when selected stock changes
  useEffect(() => {
    if (selectedStock) {
      fetchHistoricalData(selectedStock);
      fetchCurrentQuote(selectedStock);
    }
  }, [selectedStock, fetchHistoricalData, fetchCurrentQuote]);

  // Effect to fetch watchlist on component mount
  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Effect to handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchStocks(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchStocks]);

  // Refresh data function
  const refreshData = useCallback(() => {
    if (selectedStock) {
      fetchHistoricalData(selectedStock);
      fetchCurrentQuote(selectedStock);
    }
    fetchWatchlist();
  }, [selectedStock, fetchHistoricalData, fetchCurrentQuote, fetchWatchlist]);

  return {
    // Stock data
    selectedStock,
    setSelectedStock,
    stockData,
    currentQuote,
    portfolioData,
    watchlistData,

    // Search
    searchQuery,
    setSearchQuery,
    searchResults,

    // Actions
    addToWatchlist,
    removeFromWatchlist,
    refreshData,

    // State
    loading,
    error,
    clearError: () => setError(null),

    // Real-time connection status
    isConnected: socketClient.getConnectionStatus().connected,
    connectionStatus: socketClient.getConnectionStatus(),
  };
};
