// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://ekpgbpukvglxmcgokpvj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcGdicHVrdmdseG1jZ29rcHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4MzcxNTQsImV4cCI6MjA0NzQxMzE1NH0.spZ3dxJ1NR5MB1Jq6tMCrMdnyJg8g1-PAmwE6227Qqo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);