"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type LocationSelectorProps = { name?: string };

export default function LocationSelector({ name = "place_name" }: LocationSelectorProps) {
  const [countries,setCountries]=useState<string[]>([]);
  const [states,setStates]=useState<string[]>([]);
  const [cities,setCities]=useState<string[]>([]);
  const [country,setCountry]=useState("");
  const [state,setState]=useState("");
  const [city,setCity]=useState("");
  const [loading,setLoading]=useState("countries");
  const [error,setError]=useState("");

  useEffect(()=>{
    let cancelled=false;
    fetch("/api/locations?level=country",{cache:"no-store"})
      .then(async r=>{const p=await r.json();if(!r.ok)throw new Error(p.error??"country_list_failed");if(!cancelled)setCountries(p.countries??[])})
      .catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:"country_list_failed")})
      .finally(()=>{if(!cancelled)setLoading("")});
    return()=>{cancelled=true};
  },[]);

  useEffect(()=>{
    if(!country){setStates([]);setState("");setCities([]);setCity("");return}
    let cancelled=false;setLoading("states");setError("");setState("");setCities([]);setCity("");
    fetch("/api/locations?level=state&country="+encodeURIComponent(country),{cache:"no-store"})
      .then(async r=>{const p=await r.json();if(!r.ok)throw new Error(p.error??"state_list_failed");if(!cancelled)setStates(p.states??[])})
      .catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:"state_list_failed")})
      .finally(()=>{if(!cancelled)setLoading("")});
    return()=>{cancelled=true};
  },[country]);

  useEffect(()=>{
    if(!country||!state){setCities([]);setCity("");return}
    let cancelled=false;setLoading("cities");setError("");setCities([]);setCity("");
    fetch("/api/locations?level=city&country="+encodeURIComponent(country)+"&state="+encodeURIComponent(state),{cache:"no-store"})
      .then(async r=>{const p=await r.json();if(!r.ok)throw new Error(p.error??"city_list_failed");if(!cancelled)setCities(p.cities??[])})
      .catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:"city_list_failed")})
      .finally(()=>{if(!cancelled)setLoading("")});
    return()=>{cancelled=true};
  },[country,state]);

  return (
    <section className="ap-location-block">
      <SearchableSelect label="රට" value={country} disabled={loading==="countries"} options={countries} placeholder={loading==="countries"?"රටවල් ලබාගනිමින්…":"රට තෝරන්න"} onChange={setCountry}/>
      <SearchableSelect label="පළාත / ප්‍රාන්තය" value={state} disabled={!country||loading==="states"} options={states} placeholder={!country?"පළමුව රට තෝරන්න":loading==="states"?"පළාත් ලබාගනිමින්…":"පළාත තෝරන්න"} onChange={setState}/>
      <SearchableSelect label="නගරය" value={city} disabled={!state||loading==="cities"} options={cities} placeholder={!state?"පළමුව පළාත තෝරන්න":loading==="cities"?"නගර ලබාගනිමින්…":"නගරය තෝරන්න"} onChange={setCity}/>
      <input type="hidden" name={name} value={city}/>
      <input type="hidden" name="birth_country" value={country}/>
      <input type="hidden" name="birth_state" value={state}/>
      {country&&state&&city?<p className="ap-location-selected">✓ {city}, {state}, {country}</p>:null}
      {error?<p className="ap-location-error">ස්ථාන ලැයිස්තුව ලබාගත නොහැක: {error}</p>:null}
    </section>
  );
}

function normalize(value:string){return value.trim().toLocaleLowerCase().replace(/\s+/g," ")}

function SearchableSelect({label,value,disabled,options,placeholder,onChange}:{label:string;value:string;disabled:boolean;options:string[];placeholder:string;onChange:(value:string)=>void}) {
  const [query,setQuery]=useState(value);
  const [open,setOpen]=useState(false);
  const rootRef=useRef<HTMLDivElement>(null);

  useEffect(()=>setQuery(value),[value]);
  useEffect(()=>{
    function close(event:PointerEvent){if(!rootRef.current?.contains(event.target as Node)){setOpen(false);setQuery(value)}}
    document.addEventListener("pointerdown",close);
    return()=>document.removeEventListener("pointerdown",close);
  },[value]);

  const filtered=useMemo(()=>{
    const q=normalize(query);
    return q?options.filter(option=>normalize(option).includes(q)):options;
  },[options,query]);

  function select(option:string){onChange(option);setQuery(option);setOpen(false)}
  function change(next:string){
    setQuery(next);setOpen(true);
    const exact=options.find(option=>normalize(option)===normalize(next));
    if(exact)onChange(exact);else if(value)onChange("");
  }

  return (
    <div ref={rootRef} className="ap-field ap-select">
      <span>{label}</span>
      <div>
        <input required type="text" value={query} disabled={disabled} placeholder={placeholder} autoComplete="off" onFocus={()=>setOpen(true)} onChange={e=>change(e.target.value)} />
        <b aria-hidden="true">⌄</b>
      </div>
      {open&&!disabled?(
        <div className="ap-select-menu">
          {filtered.length?filtered.map(option=><button key={option} type="button" onPointerDown={e=>{e.preventDefault();select(option)}}>{option}</button>):<p>ගැලපෙන ස්ථානයක් නැහැ</p>}
        </div>
      ):null}
    </div>
  );
}
