export interface ViolationItem {
  id: string;
  code: string;
  behavior: string;
  behaviorLaw: string;
  punishLaw: string;
  remark: string;
  score: string;
  warning: string;
  fine: string;
  suspendMonth: string;
  detentionDay: string;
  revoke: string;
  forceMeasure: string;
  forceMeasureLaw: string;
  category?: '道路交通' | '行人和乘车人' | '机动车通行' | '非机动车' | '高速及快速路' | '其他';
}

export interface FilterOptions {
  keyword: string;
  onlyScore: boolean;
  onlyDetention: boolean;
  onlyRevoke: boolean;
  onlyForce: boolean;
  category: string;
}
