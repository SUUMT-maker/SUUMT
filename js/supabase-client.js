// Supabase Client Backup Initialization
// This file provides backup initialization if needed

console.log('🔧 supabase-client.js loaded');

// Check if supabaseClient is already initialized
if (!window.supabaseClient && typeof window.supabase !== 'undefined') {
    console.log('🔄 Initializing supabaseClient from supabase-client.js...');
    
    const supabaseUrl = 'https://rfqbzibewzvqopqgovbc.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWJ6aWJld3p2cW9wcWdvdmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzIwNTMsImV4cCI6MjA2OTk0ODA1M30.nAXbnAFe4jM7F56QN4b42NhwNJG_iuSXOVM5zC72Bs4';
    
    try {
        window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase client initialized from supabase-client.js');
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
    }
} else if (window.supabaseClient) {
    console.log('✅ Supabase client already initialized');
} else {
    console.warn('⚠️ Supabase SDK not loaded yet');
} 