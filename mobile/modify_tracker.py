import re

with open('src/app/(app)/tracker.tsx', 'r') as f:
    content = f.read()

# 1. Wrap Daily Block
daily_start = content.find('{/* 9. Body Signals */}')
daily_end = content.find('</LogCard>', content.find('{/* 11. Self Love Log')) + len('</LogCard>')
daily_block = content[daily_start:daily_end]
# change defaultOpen={false} to defaultOpen={true} in daily_block
daily_block = daily_block.replace('defaultOpen={false}', 'defaultOpen={true}')

daily_modal = f"""
        <Modal visible={{isDailyModalOpen}} animationType="slide" presentationStyle="pageSheet" onRequestClose={{() => setIsDailyModalOpen(false)}}>
          <View style={{flex: 1, backgroundColor: '#F9F8F6'}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 30, alignItems: 'center'}}>
              <Text style={{fontSize: 20, fontFamily: 'CormorantGaramond-SemiBold', color: '#2D2420'}}>Log Daily</Text>
              <TouchableOpacity onPress={{() => setIsDailyModalOpen(false)}}><Text style={{color: '#CD8B76', fontWeight: 'bold'}}>Done</Text></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{padding: 16, paddingBottom: 40}}>
{daily_block}
            </ScrollView>
          </View>
        </Modal>
"""
content = content[:daily_start] + daily_modal + content[daily_end:]

# 2. Wrap Lifestyle Block
life_start = content.find('{/* 12. Lifestyle (collapsible group) */}')
life_end = content.find('</SectionGroup>', life_start) + len('</SectionGroup>')
life_view_end = content.find('</View>', life_end) + len('</View>')
life_block_full = content[life_start:life_view_end]

# Extract inside SectionGroup
inner_life_start = content.find('{/* 12a. Exercise Log */}', life_start)
inner_life_end = content.find('</LogCard>', content.find('{/* 12c. Sleep Log */}', life_start)) + len('</LogCard>')
life_block = content[inner_life_start:inner_life_end]
life_block = life_block.replace('defaultOpen={false}', 'defaultOpen={true}')

life_modal = f"""
        <Modal visible={{isLifestyleModalOpen}} animationType="slide" presentationStyle="pageSheet" onRequestClose={{() => setIsLifestyleModalOpen(false)}}>
          <View style={{flex: 1, backgroundColor: '#F9F8F6'}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 30, alignItems: 'center'}}>
              <Text style={{fontSize: 20, fontFamily: 'CormorantGaramond-SemiBold', color: '#2D2420'}}>Log Lifestyle</Text>
              <TouchableOpacity onPress={{() => setIsLifestyleModalOpen(false)}}><Text style={{color: '#4DB6AC', fontWeight: 'bold'}}>Done</Text></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{padding: 16, paddingBottom: 40}}>
{life_block}
            </ScrollView>
          </View>
        </Modal>
"""
content = content.replace(life_block_full, life_modal)

# 3. Wrap Intimacy Block
int_start = content.find('{/* 13. Intimacy (collapsible group) */}')
int_end = content.find('</SectionGroup>', int_start) + len('</SectionGroup>')
int_view_end = content.find('</View>', int_end) + len('</View>')
int_block_full = content[int_start:int_view_end]

# Extract inside SectionGroup
inner_int_start = content.find('{/* 13a. Sexual Wellness */}', int_start)
inner_int_end = content.find('</LogCard>', inner_int_start) + len('</LogCard>')
int_block = content[inner_int_start:inner_int_end]
int_block = int_block.replace('defaultOpen={false}', 'defaultOpen={true}')

int_modal = f"""
        <Modal visible={{isIntimacyModalOpen}} animationType="slide" presentationStyle="pageSheet" onRequestClose={{() => setIsIntimacyModalOpen(false)}}>
          <View style={{flex: 1, backgroundColor: '#F9F8F6'}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 30, alignItems: 'center'}}>
              <Text style={{fontSize: 20, fontFamily: 'CormorantGaramond-SemiBold', color: '#2D2420'}}>Log Intimacy</Text>
              <TouchableOpacity onPress={{() => setIsIntimacyModalOpen(false)}}><Text style={{color: '#E8924E', fontWeight: 'bold'}}>Done</Text></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{padding: 16, paddingBottom: 40}}>
{int_block}
            </ScrollView>
          </View>
        </Modal>
"""
content = content.replace(int_block_full, int_modal)

with open('src/app/(app)/tracker.tsx', 'w') as f:
    f.write(content)

