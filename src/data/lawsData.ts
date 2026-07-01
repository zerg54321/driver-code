import { ViolationItem } from '../types';
import { RAW_CSV } from './rawCsv';
import roadLawDb from './road_law.json';
import roadLawRulesDb from './road_law_rules.json';
import bjRoadRulesDb from './bj_road_rules.json';

// Helper to convert number to Chinese numeral (e.g. 1 -> 一, 104 -> 一百零四)
function toChineseNumeral(num: number): string {
  const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (num <= 10) {
    return chineseNums[num];
  } else if (num < 20) {
    return '十' + (num % 10 === 0 ? '' : chineseNums[num % 10]);
  } else if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return chineseNums[ten] + '十' + (one === 0 ? '' : chineseNums[one]);
  } else {
    const hundred = Math.floor(num / 100);
    const tenVal = Math.floor((num % 100) / 10);
    const one = num % 10;
    
    let res = chineseNums[hundred] + '百';
    if (tenVal === 0 && one !== 0) {
      res += '零' + chineseNums[one];
    } else if (tenVal !== 0) {
      res += chineseNums[tenVal] + '十' + (one === 0 ? '' : chineseNums[one]);
    }
    return res;
  }
}

// Robust CSV parser to handle quotes and nested commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

interface LawMatch {
  db: 'law' | 'reg' | 'bj';
  artNum: number;
  paraNum?: number;
  itemNum?: number;
}

// Parses a law reference string like "law:100,1;reg:28;bj:92,1,2"
function parseLawRefs(lawRef: string): LawMatch[] {
  if (!lawRef) return [];
  const refs = lawRef.split(';').map(s => s.trim()).filter(Boolean);
  const result: LawMatch[] = [];

  for (const ref of refs) {
    const parts = ref.split(':');
    if (parts.length !== 2) continue;

    const db = parts[0].trim().toLowerCase() as 'law' | 'reg' | 'bj';
    if (db !== 'law' && db !== 'reg' && db !== 'bj') continue;

    const subParts = parts[1].split(',').map(s => s.trim());
    const artNum = parseInt(subParts[0], 10);
    if (isNaN(artNum)) continue;

    const match: LawMatch = { db, artNum };
    if (subParts.length > 1) {
      const paraNum = parseInt(subParts[1], 10);
      if (!isNaN(paraNum)) {
        match.paraNum = paraNum;
      }
    }
    if (subParts.length > 2) {
      const itemNum = parseInt(subParts[2], 10);
      if (!isNaN(itemNum)) {
        match.itemNum = itemNum;
      }
    }

    result.push(match);
  }

  return result;
}

// Fetches the precise matched text and builds title for a LawMatch
function getPreciseLawText(match: LawMatch): { title: string; content: string } | null {
  const dbMap = {
    law: { name: '《中华人民共和国道路交通安全法》', data: roadLawDb },
    reg: { name: '《中华人民共和国道路交通安全法实施条例》', data: roadLawRulesDb },
    bj: { name: '《北京市实施〈道路交通安全法〉办法》', data: bjRoadRulesDb }
  };

  const dbInfo = dbMap[match.db];
  if (!dbInfo) return null;

  const article = (dbInfo.data.entities as any)[match.artNum.toString()];
  if (!article) return null;

  // Build a highly precise legal citation title
  let title = `${dbInfo.name}第${toChineseNumeral(match.artNum)}条`;
  if (match.paraNum !== undefined) {
    title += `第${toChineseNumeral(match.paraNum)}款`;
  }
  if (match.itemNum !== undefined) {
    title += `第（${toChineseNumeral(match.itemNum)}）项`;
  }

  let content = '';

  if (match.paraNum !== undefined) {
    const clause = article.clauses[match.paraNum.toString()];
    if (clause) {
      if (match.itemNum !== undefined) {
        // Return specific item
        const itemText = clause.items?.[match.itemNum.toString()];
        if (itemText) {
          content = `${clause.text}\n${itemText}`;
        } else {
          content = clause.text;
        }
      } else {
        // Return clause text and all its items
        content = clause.text;
        if (clause.items && Object.keys(clause.items).length > 0) {
          const sortedItems = Object.entries(clause.items)
            .sort(([k1], [k2]) => parseInt(k1, 10) - parseInt(k2, 10))
            .map(([_, v]) => v as string);
          content += '\n' + sortedItems.join('\n');
        }
      }
    }
  } else {
    // Return all clauses of the article
    const clausesList = Object.entries(article.clauses)
      .sort(([k1], [k2]) => parseInt(k1, 10) - parseInt(k2, 10))
      .map(([_, c]: [string, any]) => {
        let text = c.text;
        if (c.items && Object.keys(c.items).length > 0) {
          const sortedItems = Object.entries(c.items)
            .sort(([k1], [k2]) => parseInt(k1, 10) - parseInt(k2, 10))
            .map(([_, v]) => v as string);
          text += '\n' + sortedItems.join('\n');
        }
        return text;
      });
    content = clausesList.join('\n');
  }

  return { title, content };
}

// Expose the new full JSON databases for law reading page
export function getLawsList() {
  return [roadLawDb, roadLawRulesDb, bjRoadRulesDb];
}

let cachedViolations: ViolationItem[] | null = null;

export function getViolationsList(): ViolationItem[] {
  if (cachedViolations) return cachedViolations;

  const lines = RAW_CSV.trim().split('\n');
  const result: ViolationItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = parseCSVLine(line);
    if (parts.length < 5) continue;

    const [
      id = '',
      code = '',
      behavior = '',
      behaviorLaw = '',
      punishLaw = '',
      remark = '',
      score = '',
      warning = '',
      fine = '',
      suspendMonth = '',
      detentionDay = '',
      revoke = '',
      forceMeasure = '',
      forceMeasureLaw = ''
    ] = parts;

    let category: ViolationItem['category'] = '道路交通';
    if (behavior.includes('行人') || behavior.includes('乘车')) {
      category = '行人和乘车人';
    } else if (behavior.includes('高速') || behavior.includes('快速路')) {
      category = '高速及快速路';
    } else if (behavior.includes('自行车') || behavior.includes('三轮') || behavior.includes('畜力') || behavior.includes('非机动车')) {
      category = '非机动车';
    } else if (behavior.includes('驾驶') || behavior.includes('客运') || behavior.includes('货运') || behavior.includes('车道') || behavior.includes('停车') || behavior.includes('灯光')) {
      category = '机动车通行';
    }

    result.push({
      id,
      code,
      behavior,
      behaviorLaw,
      punishLaw,
      remark,
      score,
      warning,
      fine,
      suspendMonth,
      detentionDay,
      revoke,
      forceMeasure,
      forceMeasureLaw,
      category
    });
  }

  cachedViolations = result;
  return result;
}

export interface MatchedLaw {
  title: string;
  content: string;
  db: 'law' | 'reg' | 'bj';
  artNum: number;
}

/**
 * 将拼音或数据库前缀的代码（如 'law:90;bj:98,1,9'）格式化为美观的、无泄露的人类可读文本
 */
export function formatLawReference(lawRef: string): string {
  if (!lawRef) return '道路交通安全法相关规定';
  const matches = parseLawRefs(lawRef);
  if (matches.length === 0) return '道路交通安全法相关规定';

  const dbShortNames = {
    law: '《道路交通安全法》',
    reg: '《实施条例》',
    bj: '《北京实施办法》'
  };

  return matches.map(match => {
    const name = dbShortNames[match.db] || '';
    const art = `第${toChineseNumeral(match.artNum)}条`;
    return `${name}${art}`;
  }).join('、');
}

/**
 * 精准法条解析与路由匹配
 * 只显示涉及的特定“条”、“款”或“项”，实现信息去噪
 */
export function matchLawArticles(lawRef: string): MatchedLaw[] {
  if (!lawRef) return [];
  const parsedMatches = parseLawRefs(lawRef);
  const matchedList: MatchedLaw[] = [];

  for (const match of parsedMatches) {
    const res = getPreciseLawText(match);
    if (res) {
      matchedList.push({
        title: res.title,
        content: res.content,
        db: match.db,
        artNum: match.artNum
      });
    }
  }

  return matchedList;
}
