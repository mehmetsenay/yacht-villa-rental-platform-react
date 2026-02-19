
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
    console.log("Testing Supabase Connection...");

    // 1. List Buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error("Error listing buckets:", listError);
        return;
    }

    console.log("Existing Buckets:", buckets?.map(b => b.name));

    const targetBucket = 'yatlar-foto';
    const otherBucket = 'villalar-foto';

    const hasTarget = buckets?.some(b => b.name === targetBucket);

    if (hasTarget) {
        console.log(`Bucket '${targetBucket}' exists.`);
    } else {
        console.log(`Bucket '${targetBucket}' does NOT exist. Attempting creation...`);
        const { data: created, error: createError } = await supabase.storage.createBucket(targetBucket, {
            public: true
        });

        if (createError) {
            console.error("Error creating bucket:", createError);
        } else {
            console.log(`Bucket '${targetBucket}' created successfully.`);
        }
    }

    // 2. Try Upload
    console.log(`Attempting upload to '${targetBucket}'...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(targetBucket)
        .upload('test-file.txt', 'Hello Supabase', {
            contentType: 'text/plain',
            upsert: true
        });

    if (uploadError) {
        console.error("Upload Error:", uploadError);
    } else {
        console.log("Upload Success:", uploadData);
        const { data: publicUrl } = supabase.storage.from(targetBucket).getPublicUrl('test-file.txt');
        console.log("Public URL:", publicUrl.publicUrl);
    }
}

testSupabase();
