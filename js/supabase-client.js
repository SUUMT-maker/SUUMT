// Supabase Client Initialization
// This file ensures Supabase is properly initialized globally

console.log('🔧 supabase-client.js loaded');

// Check if Supabase is already initialized
if (typeof window.supabase === 'undefined') {
    console.warn('⚠️ Supabase not found, waiting for CDN to load...');
    
    // Wait for Supabase to be available
    const checkSupabase = setInterval(() => {
        if (typeof window.supabase !== 'undefined') {
            clearInterval(checkSupabase);
            
            const supabaseUrl = 'https://rfqbzibewzvqopqgovbc.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWJ6aWJld3p2cW9wcWdvdmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzIwNTMsImV4cCI6MjA2OTk0ODA1M30.nAXbnAFe4jM7F56QN4b42NhwNJG_iuSXOVM5zC72Bs4';
            
            try {
                window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
                console.log('✅ Supabase client initialized in supabase-client.js');
            } catch (error) {
                console.error('❌ Failed to initialize Supabase client:', error);
            }
        }
    }, 100);
    
    // Timeout after 5 seconds
    setTimeout(() => {
        clearInterval(checkSupabase);
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase failed to load within 5 seconds');
        }
    }, 5000);
} else {
    console.log('✅ Supabase already initialized');
} 