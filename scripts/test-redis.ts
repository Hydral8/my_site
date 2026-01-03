// Test script to verify Redis connection and operations
import { 
  redisSet, 
  redisGet, 
  redisDelete, 
  redisExists,
  setSession,
  getSession,
  setGlobalPushToken,
  getGlobalPushToken,
  saveChatMessages,
  loadChatMessages,
  saveAIChatMessages,
  loadAIChatMessages
} from '../lib/redis-service';

async function testRedis() {
  console.log('🧪 Starting Redis tests...\n');

  try {
    // Test 1: Basic SET/GET
    console.log('Test 1: Basic SET/GET');
    const testKey = 'test:basic';
    const testValue = 'Hello Redis!';
    const setResult = await redisSet(testKey, testValue, 60);
    console.log(`  ✓ SET result: ${setResult}`);
    
    const getResult = await redisGet(testKey);
    console.log(`  ✓ GET result: ${getResult}`);
    console.log(`  ${getResult === testValue ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 2: EXISTS
    console.log('Test 2: EXISTS check');
    const existsResult = await redisExists(testKey);
    console.log(`  ✓ EXISTS result: ${existsResult}`);
    console.log(`  ${existsResult ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 3: DELETE
    console.log('Test 3: DELETE');
    const deleteResult = await redisDelete(testKey);
    console.log(`  ✓ DELETE result: ${deleteResult}`);
    const afterDelete = await redisGet(testKey);
    console.log(`  ✓ GET after delete: ${afterDelete}`);
    console.log(`  ${afterDelete === null ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 4: Session storage
    console.log('Test 4: Session storage');
    const testSessionId = 'test-session-123';
    const sessionData = JSON.stringify({ sessionId: testSessionId, createdAt: new Date().toISOString() });
    const sessionSet = await setSession(testSessionId, sessionData, 60);
    console.log(`  ✓ SET session: ${sessionSet}`);
    
    const sessionGet = await getSession(testSessionId);
    console.log(`  ✓ GET session: ${sessionGet ? 'found' : 'not found'}`);
    console.log(`  ${sessionGet === sessionData ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 5: Global push token
    console.log('Test 5: Global push token');
    const testToken = 'ExponentPushToken[test-token-123]';
    const tokenSet = await setGlobalPushToken(testToken, 60);
    console.log(`  ✓ SET push token: ${tokenSet}`);
    
    const tokenGet = await getGlobalPushToken();
    console.log(`  ✓ GET push token: ${tokenGet ? 'found' : 'not found'}`);
    console.log(`  ${tokenGet === testToken ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 6: Chat messages (real user)
    console.log('Test 6: Chat messages (real user)');
    const testSessionId2 = 'test-session-chat';
    const testMessages = [
      { id: 1, text: 'Hello', sender: 'visitor', timestamp: new Date().toISOString() },
      { id: 2, text: 'Hi there!', sender: 'me', timestamp: new Date().toISOString() }
    ];
    const chatSave = await saveChatMessages(testSessionId2, 1, testMessages, 60);
    console.log(`  ✓ SAVE chat messages: ${chatSave}`);
    
    const chatLoad = await loadChatMessages(testSessionId2, 1);
    console.log(`  ✓ LOAD chat messages: ${chatLoad ? `${chatLoad.length} messages` : 'not found'}`);
    console.log(`  ${chatLoad && chatLoad.length === 2 ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 7: AI chat messages
    console.log('Test 7: AI chat messages');
    const aiMessages = [
      { id: 1, text: 'AI response', sender: 'me', timestamp: new Date().toISOString() }
    ];
    const aiSave = await saveAIChatMessages(testSessionId2, aiMessages, 60);
    console.log(`  ✓ SAVE AI chat messages: ${aiSave}`);
    
    const aiLoad = await loadAIChatMessages(testSessionId2);
    console.log(`  ✓ LOAD AI chat messages: ${aiLoad ? `${aiLoad.length} messages` : 'not found'}`);
    console.log(`  ${aiLoad && aiLoad.length === 1 ? '✅ PASS' : '❌ FAIL'}\n`);

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await redisDelete('session:test-session-123');
    await redisDelete('push:token:global');
    await redisDelete('chat:test-session-chat:1');
    await redisDelete('chat:ai:test-session-chat');
    console.log('  ✓ Cleanup complete\n');

    console.log('✅ All Redis tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Redis test failed:', error);
    process.exit(1);
  }
}

testRedis();

