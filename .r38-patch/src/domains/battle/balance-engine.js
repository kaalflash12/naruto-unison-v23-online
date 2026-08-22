const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function balanceFactorForTechnique(tech){
  const ratio=Number(tech?.balance?.ratio??1);
  if(!Number.isFinite(ratio)||ratio<=0)return 1;
  if(ratio<.82)return clamp(1+(.82-ratio)*1.25,1,1.25);
  if(ratio>1.18)return clamp(1-(ratio-1.18)*.90,.80,1);
  return 1;
}
export function effectiveBalanceRatio(tech){return Number(tech?.balance?.ratio??1)*balanceFactorForTechnique(tech);}
export function balanceLabel(tech){const f=balanceFactorForTechnique(tech);if(Math.abs(f-1)<.005)return'';const pct=Math.round((f-1)*100);return `BALANCE R38.1 ${pct>0?'+':''}${pct}%`;}
