import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, MapPinIcon, UsersIcon, CopyIcon, FlameIcon } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Challenge } from '../types';

export function ChallengeCard({challenge,to}:{challenge:Challenge;to:string;}) {
  const highPriority=challenge.priority?.level==='high';
  return <Link to={to} aria-label={`Open challenge: ${challenge.title}`} className={`group flex h-full flex-col overflow-hidden rounded-card border bg-surface transition-[border-color,box-shadow,transform] duration-200 ease-soft hover:-translate-y-0.5 hover:shadow-raise ${highPriority?'border-clay-200':'border-line hover:border-forest-200'}`}>
    {challenge.mediaUrl && challenge.mediaType==='image' && <img src={challenge.mediaUrl} alt={`Photo submitted with the report: ${challenge.title}`} className="h-36 w-full object-cover"/>}
    {challenge.mediaUrl && challenge.mediaType==='video' && <video src={challenge.mediaUrl} muted playsInline className="h-36 w-full object-cover"/>}
    <div className="flex flex-1 flex-col p-5">
      <div className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted"><span className="font-semibold text-forest-600">{challenge.domain}</span><span>·</span><span className="inline-flex items-center gap-1"><MapPinIcon className="h-3 w-3"/>{challenge.city}, {challenge.district}</span></div>
      {highPriority&&<div className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-clay-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-clay-700"><FlameIcon className="h-3.5 w-3.5"/> HIGH PRIORITY · {challenge.supporters} SUPPORTS</div>}
      <h3 className="font-serif text-lg font-semibold leading-snug text-ink"><span className="transition-colors duration-150 ease-soft group-hover:text-forest-700">{challenge.title}</span></h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{challenge.description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5"><StatusBadge status={challenge.status}/><div className="flex items-center gap-3 text-xs font-medium text-ink-muted"><span className="inline-flex items-center gap-1"><UsersIcon className="h-3.5 w-3.5"/>{challenge.supporters}</span>{challenge.duplicatesMerged>0&&<span className="inline-flex items-center gap-1" title={`${challenge.duplicatesMerged} duplicate reports merged`}><CopyIcon className="h-3.5 w-3.5"/>{challenge.duplicatesMerged} merged</span>}{!highPriority&&challenge.priority&&<span className="inline-flex items-center gap-1"><AlertTriangleIcon className="h-3.5 w-3.5"/>{challenge.priority.level}</span>}</div></div>
    </div>
  </Link>;
}
