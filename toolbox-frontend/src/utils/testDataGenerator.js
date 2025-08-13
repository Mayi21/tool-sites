// 已移除 analytics 访问统计逻辑，保留空实现以避免引用错误
class TestDataGenerator {
  async generateTestData() {
    console.log('Analytics removed: skip generating test data');
    return {};
  }
  clearTestData() {
    localStorage.removeItem('toolbox_visits');
  }
  showCurrentData() {
    console.log('Analytics removed');
  }
}

const testDataGenerator = new TestDataGenerator();

export { testDataGenerator };