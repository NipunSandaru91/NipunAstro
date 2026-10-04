import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loadDeepDasha } from '@/lib/calculations/load-deep-dasha';
import { buildDeepDashaView } from '@/lib/calculations/deep-dasha-view';
import DeepDashaExplorer from '@/app/components/deep-dasha-explorer';
import AppNav from '@/app/components/app-nav';
import Link from 'next/link';

type Props={params:Promise<{id:string}>;searchParams:Promise<{period?:string}>};
export default async function DashaPage({params,searchParams}:Props){
 const {id}=await params;
 const {period}=await searchParams;
 const supabase=await createClient();
 const {data:profile,error:profileError}=await supabase.from('profiles').select('account_type').single();
 if(profileError||profile?.account_type!=='PROFESSIONAL')redirect('/dashboard');
 const loaded=await loadDeepDasha(supabase,id,5);
 if(!loaded)notFound();
 if(!loaded.periods.length)return <><AppNav/><main className="astro-shell p-6"><h1 className="text-2xl">දශා දත්ත සූදානම් නැත</h1><p className="mt-3">කේන්දර ගණනය සම්පූර්ණ වී ඇති බව පරීක්ෂා කරන්න.</p><Link href={`/calculations/${id}`} className="mt-4 inline-block underline">කේන්දරයට යන්න</Link></main></>;
 // Request-time snapshot; no clock enters the deterministic engine.
 // eslint-disable-next-line react-hooks/purity
 const now=Date.now();
 let view;
 try{view=buildDeepDashaView(loaded.periods,period,now);}catch{notFound();}
 return <><AppNav/><DeepDashaExplorer calculationId={id} title={loaded.run.subject_name??loaded.run.input_place_name??'කේන්දරය'} timezone={loaded.run.input_timezone??'UTC'} now={now} view={view}/></>;
}
