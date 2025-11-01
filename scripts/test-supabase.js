// Test Supabase connection and basic operations
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('🔗 Testing Supabase connection...\n');
    
    try {
        // Test 1: Fetch existing entries
        console.log('Test 1: Fetching study entries...');
        const { data, error } = await supabase
            .from('study_entries')
            .select('*')
            .order('date', { ascending: false })
            .limit(5);
        
        if (error) {
            console.error('❌ Error fetching data:', error.message);
            return false;
        }
        
        console.log('✅ Successfully fetched', data.length, 'entries');
        if (data.length > 0) {
            console.log('   Latest entry:', data[0]);
        }
        
        // Test 2: Insert a test entry
        console.log('\nTest 2: Inserting test entry...');
        const testEntry = {
            date: new Date().toISOString().split('T')[0],
            hours: 1,
            minutes: 30
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('study_entries')
            .insert(testEntry)
            .select();
        
        if (insertError) {
            console.error('❌ Error inserting data:', insertError.message);
            return false;
        }
        
        console.log('✅ Successfully inserted test entry:', insertData[0]);
        
        // Test 3: Delete the test entry
        console.log('\nTest 3: Cleaning up test entry...');
        const { error: deleteError } = await supabase
            .from('study_entries')
            .delete()
            .eq('id', insertData[0].id);
        
        if (deleteError) {
            console.error('❌ Error deleting test entry:', deleteError.message);
            return false;
        }
        
        console.log('✅ Successfully deleted test entry');
        
        console.log('\n✨ All tests passed! Supabase is properly integrated.');
        return true;
        
    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
        return false;
    }
}

testConnection().then(success => {
    process.exit(success ? 0 : 1);
});
