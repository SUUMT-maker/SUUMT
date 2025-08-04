#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// MCP 서버 생성
const server = new Server(
  {
    name: 'supabase-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Supabase 데이터베이스 연결 테스트
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'test_connection':
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) throw error;
        return {
          content: [
            {
              type: 'text',
              text: `✅ Supabase 연결 성공! 데이터베이스 접근 가능.`,
            },
          ],
        };
        
      case 'get_user_stats':
        const { data: stats, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', args.user_id);
        if (statsError) throw statsError;
        return {
          content: [
            {
              type: 'text',
              text: `사용자 통계: ${JSON.stringify(stats, null, 2)}`,
            },
          ],
        };
        
      default:
        return {
          content: [
            {
              type: 'text',
              text: `알 수 없는 도구: ${name}`,
            },
          ],
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ 오류 발생: ${error.message}`,
        },
      ],
    };
  }
});

// 서버 시작
const transport = new StdioServerTransport();
server.connect(transport);

console.error('Supabase MCP 서버가 시작되었습니다.'); 