// ===== NexusPrimer 2.0 — Veri Toplama Hook =====
// src/hooks/useDataCollection.ts
//
// Kullanıcı davranışlarını ölçer ve CSV dışa aktarımı sağlar.
// KVKK: Gerçek isim, e-posta, cihaz ID toplanmaz.

import { useRef, useCallback, useState } from 'react';
import type { UserProfile } from '../types';

export interface SessionRow {
  oturum_id: string;
  katilimci_no: string;
  karar_suresi_sn: number;
  onceki_yanlis_sayisi: number;
  ipucu_sayisi: number;
  karar_degistirme_sayisi: number;
  sahne_no: number;
  seviye: number;
  onceki_karar_suresi: number;
  kararsizlik_suresi: number;
  ipucu_gerekli: number;
  kaynak: 'gercek';
}

export interface DataCollectionState {
  startDecisionTimer: () => void;
  recordHintUsed: () => void;
  recordDecisionChange: () => void;
  recordFirstInteraction: () => void;
  finalizeRow: (params: {
    sahneNo: number;
    oncekiYanlisSayisi: number;
    oncekiKararSuresi: number;
    karar: 'A' | 'B';
  }) => SessionRow;
  exportCSV: (rows: SessionRow[]) => void;
  getMetrics: () => {
    ipucu_sayisi: number;
    karar_degistirme_sayisi: number;
  };
  resetForDecision: () => void;
}

function generateSessionId(): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 6);
  return `oturum-${ts}${rnd}`;
}

function getLevelCode(level: UserProfile['level']): number {
  return level === 'experienced' ? 1 : 0;
}

function computeIpucuGerekli(
  ipucu_sayisi: number,
  karar_suresi_sn: number,
  karar_degistirme_sayisi: number
): number {
  // Etiketleme kuralı (data/SOZLUK.md ile aynı)
  return (ipucu_sayisi >= 2 || karar_suresi_sn >= 30 || karar_degistirme_sayisi >= 2) ? 1 : 0;
}

export function useDataCollection(
  profile: UserProfile | null,
  participantNo: string = 'katilimci-anonim'
) {
  const [sessionId] = useState<string>(() => generateSessionId());
  const decisionStartRef = useRef<number | null>(null);
  const firstInteractionRef = useRef<number | null>(null);
  const ipucuSayisiRef = useRef(0);
  const kararDegistirmeSayisiRef = useRef(0);
  const lastInteractionRef = useRef<number | null>(null);

  // Her render'da değişmeyen sabit referanslar
  const startDecisionTimer = useCallback(() => {
    decisionStartRef.current = performance.now();
    firstInteractionRef.current = null;
    lastInteractionRef.current = null;
  }, []);

  const recordHintUsed = useCallback(() => {
    ipucuSayisiRef.current += 1;
    if (firstInteractionRef.current === null) {
      firstInteractionRef.current = performance.now();
    }
  }, []);

  const recordDecisionChange = useCallback(() => {
    kararDegistirmeSayisiRef.current += 1;
    if (firstInteractionRef.current === null) {
      firstInteractionRef.current = performance.now();
    }
  }, []);

  const recordFirstInteraction = useCallback(() => {
    if (firstInteractionRef.current === null) {
      firstInteractionRef.current = performance.now();
    }
  }, []);

  const resetForDecision = useCallback(() => {
    ipucuSayisiRef.current = 0;
    kararDegistirmeSayisiRef.current = 0;
    decisionStartRef.current = null;
    firstInteractionRef.current = null;
  }, []);

  const getMetrics = useCallback(() => ({
    ipucu_sayisi: ipucuSayisiRef.current,
    karar_degistirme_sayisi: kararDegistirmeSayisiRef.current,
  }), []);

  const finalizeRow = useCallback(({
    sahneNo,
    oncekiYanlisSayisi,
    oncekiKararSuresi,
  }: {
    sahneNo: number;
    oncekiYanlisSayisi: number;
    oncekiKararSuresi: number;
    karar: 'A' | 'B';
  }): SessionRow => {
    const now = performance.now();
    const kararSuresi = decisionStartRef.current
      ? Math.round((now - decisionStartRef.current) / 1000)
      : 0;
    const kararsizlikSuresi = firstInteractionRef.current && decisionStartRef.current
      ? Math.round((firstInteractionRef.current - decisionStartRef.current) / 1000)
      : 0;

    const ipucuSayisi = ipucuSayisiRef.current;
    const kararDegistirmeSayisi = kararDegistirmeSayisiRef.current;
    const seviye = profile ? getLevelCode(profile.level) : 0;

    return {
      oturum_id: sessionId,
      katilimci_no: participantNo,
      karar_suresi_sn: kararSuresi,
      onceki_yanlis_sayisi: oncekiYanlisSayisi,
      ipucu_sayisi: ipucuSayisi,
      karar_degistirme_sayisi: kararDegistirmeSayisi,
      sahne_no: sahneNo,
      seviye,
      onceki_karar_suresi: Math.round(oncekiKararSuresi),
      kararsizlik_suresi: kararsizlikSuresi,
      ipucu_gerekli: computeIpucuGerekli(ipucuSayisi, kararSuresi, kararDegistirmeSayisi),
      kaynak: 'gercek',
    };
  }, [profile, participantNo, sessionId]);

  const exportCSV = useCallback((rows: SessionRow[]) => {
    if (rows.length === 0) {
      alert('Dışa aktarılacak veri yok.');
      return;
    }

    const headers = [
      'oturum_id', 'katilimci_no', 'karar_suresi_sn', 'onceki_yanlis_sayisi',
      'ipucu_sayisi', 'karar_degistirme_sayisi', 'sahne_no', 'seviye',
      'onceki_karar_suresi', 'kararsizlik_suresi', 'ipucu_gerekli', 'kaynak'
    ];

    const csvLines = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => String(row[h as keyof SessionRow])).join(',')),
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexusprimer_oturum_${sessionId}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionId]);

  return {
    startDecisionTimer,
    recordHintUsed,
    recordDecisionChange,
    recordFirstInteraction,
    finalizeRow,
    exportCSV,
    getMetrics,
    resetForDecision,
    sessionId,
  };
}

