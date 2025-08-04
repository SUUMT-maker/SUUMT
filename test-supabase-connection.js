#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseConnection() {
  console.log('🔗 Supabase 연결 테스트 시작...\n');
  
  // 환경 변수 확인
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 환경 변수가 설정되지 않았습니다.');
    console.log('env.example 파일을 .env로 복사하고 실제 값으로 설정하세요.');
    return;
  }
  
  console.log('📋 설정 확인:');
  console.log(`  URL: ${supabaseUrl}`);
  console.log(`  Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('');
  
  try {
    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 연결 테스트
    console.log('🔄 데이터베이스 연결 테스트 중...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ 연결 실패:', error.message);
      return;
    }
    
    console.log('✅ Supabase 연결 성공!');
    console.log('📊 데이터베이스 접근 가능');
    
    // 추가 테스트: 테이블 목록 확인
    console.log('\n📋 사용 가능한 테이블 확인 중...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (!tablesError && tables) {
      console.log('📊 공개 테이블 목록:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error.message);
  }
}

// 테스트 실행
testSupabaseConnection(); 