"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, RefreshCw, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingOverlay, type LoadingOverlayStep } from "@/components/common/loading-overlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useChannelsQuery } from "@/features/channels/hooks/use-channels-query";
import { appRoutes } from "@/lib/constants/routes";
import { createAutomationProject, getApprovedSubreddits, getAutomationProject, getNiches, seedNiches,
  updateAutomationProject, uploadQueuedClip, validateAccount } from "../api";
import type { AutomationMode, ContentType, ProjectInput, RedditConfig, VisualType } from "../types";

const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Manila";
const today = new Date().toISOString().slice(0, 10);
const contentTypes: Array<{value:ContentType;label:string;description:string}> = [
  { value: "FACELESS_NICHE", label: "Faceless Niche Story", description: "Generate a unique researched story each day." },
  { value: "REDDIT_STORY", label: "Reddit Story", description: "Transform an eligible Reddit submission over a random background-video segment." },
  { value: "CLIP_UPLOAD", label: "Clip Upload", description: "Queue your own video without story generation." }
];
const defaultReddit: RedditConfig = {
  sourceMode: "AUTO", subreddits: [], sortMethod: "BEST_ELIGIBLE", minimumScore: 50,
  minimumComments: 10, minimumBodyLength: 300, allowNSFW: false, includeComments: false,
  excludeLocked: true, contentFilters: [], attributionMode: "link", allowCrossAccountReuse: false
};
type SavePhase = "idle" | "saving" | "uploading" | "opening";

export function CreateProjectForm({ editProjectId }: { editProjectId?: string }) {
  const router=useRouter(); const queryClient=useQueryClient(); const channels=useChannelsQuery();
  const niches=useQuery({queryKey:["project-niches"],queryFn:getNiches,retry:1});
  const approved=useQuery({queryKey:["approved-subreddits"],queryFn:getApprovedSubreddits,enabled:true,retry:1});
  const existing=useQuery({queryKey:["automation-project",editProjectId],queryFn:()=>getAutomationProject(editProjectId!),enabled:Boolean(editProjectId)});
  const [contentType,setContentType]=useState<ContentType>("FACELESS_NICHE");
  const [name,setName]=useState(""); const [nicheId,setNicheId]=useState(""); const [accountId,setAccountId]=useState("");
  const [language,setLanguage]=useState("en"); const [uploadTime,setUploadTime]=useState("19:00"); const [timezone,setTimezone]=useState(detectedTimezone);
  const [visualType,setVisualType]=useState<VisualType>("AUTO"); const [automationMode,setAutomationMode]=useState<AutomationMode>("approval_before_upload");
  const [automationEnabled,setAutomationEnabled]=useState(true); const [reddit,setReddit]=useState<RedditConfig>(defaultReddit);
  const [customSubreddit,setCustomSubreddit]=useState(""); const [video,setVideo]=useState<File>(); const [thumbnail,setThumbnail]=useState<File>();
  const [subtitles,setSubtitles]=useState<File>();
  const [phase,setPhase]=useState<SavePhase>("idle");
  const [videoTitle,setVideoTitle]=useState(""); const [description,setDescription]=useState(""); const [hashtags,setHashtags]=useState("");
  const [scheduleDate,setScheduleDate]=useState(today); const [privacy,setPrivacy]=useState<"private"|"public"|"unlisted">("private");
  const [audience,setAudience]=useState<"not_made_for_kids"|"made_for_kids">("not_made_for_kids");
  const previewUrl=useMemo(()=>video?URL.createObjectURL(video):undefined,[video]);
  useEffect(()=>()=>{if(previewUrl)URL.revokeObjectURL(previewUrl)},[previewUrl]);
  const selectedNiche=niches.data?.niches.find((item)=>item.id===nicheId);
  const selectedAccount=channels.data?.find((channel)=>channel.id===accountId);
  const accountCheck=useQuery({queryKey:["account-validation",accountId],queryFn:()=>validateAccount(accountId),enabled:Boolean(accountId),retry:1});

  useEffect(()=>{if(!existing.data)return;const p=existing.data;setName(p.title);setContentType(p.contentType);setNicheId(p.nicheId??"");
    setAccountId(p.accountId);setLanguage(p.language);setUploadTime(p.uploadTime);setTimezone(p.timezone);
    setVisualType(p.contentType==="FACELESS_NICHE"?p.visualType??"AUTO":"AUTO");setAutomationMode(p.automationMode);setAutomationEnabled(p.automationEnabled)},[existing.data]);

  useEffect(()=>{if(contentType!=="FACELESS_NICHE"||!nicheId||!accountId)return;const channel=channels.data?.find((item)=>item.id===accountId);
    if(channel&&!channel.nicheLockExempt&&channel.nicheId&&channel.nicheId!==nicheId)setAccountId("")},[contentType,nicheId,accountId,channels.data]);

  const typeValid=contentType==="FACELESS_NICHE"?Boolean(nicheId&&selectedNiche?.active):
    contentType==="REDDIT_STORY"?Boolean(reddit.sourceMode==="AUTO"||reddit.subreddits.length):Boolean(video||editProjectId)&&videoTitle.trim().length>=2;
  const valid=Boolean(name.trim().length>=2&&accountId&&language&&timezone&&/^([01]\d|2[0-3]):[0-5]\d$/.test(uploadTime)&&
    selectedAccount?.status==="connected"&&accountCheck.data?.authenticationActive&&typeValid);
  const payload:ProjectInput={name:name.trim(),contentType,nicheId:contentType==="FACELESS_NICHE"?nicheId:undefined,accountId,language,
    uploadTime,timezone,visualType:contentType==="FACELESS_NICHE"?visualType:"AUTO",automationMode,automationEnabled,
    redditConfig:contentType==="REDDIT_STORY"?reddit:undefined};

  const save=useMutation({mutationFn:async()=>{
    setPhase("saving");
    const project=editProjectId?await updateAutomationProject(editProjectId,payload):await createAutomationProject(payload);
    if(contentType==="CLIP_UPLOAD"&&video){
      setPhase("uploading");
      const form=new FormData();form.append("video",video);if(thumbnail)form.append("thumbnail",thumbnail);
      if(subtitles)form.append("subtitles",subtitles);form.append("title",videoTitle.trim());form.append("description",description);form.append("hashtags",hashtags);
      form.append("language",language);form.append("privacyStatus",privacy);form.append("audienceSetting",audience);
      if(scheduleDate)form.append("scheduledAt",zonedDateTime(scheduleDate,uploadTime,timezone));
      await uploadQueuedClip(project.id,form);
    }
    return project;
  },onSuccess:(project)=>{setPhase("opening");router.push(appRoutes.projects+"/"+project.id)},onError:()=>setPhase("idle")});
  const seed=useMutation({mutationFn:seedNiches,onSuccess:async()=>{await queryClient.invalidateQueries({queryKey:["project-niches"]});await niches.refetch()}});
  const selectNiche=(value:string)=>{setNicheId(value);const niche=niches.data?.niches.find((item)=>item.id===value);if(niche)setLanguage(niche.defaultLanguage)};
  const setType=(value:ContentType)=>{setContentType(value);if(value!=="FACELESS_NICHE")setNicheId("");if(value!=="FACELESS_NICHE")setVisualType("AUTO")};
  const toggleSubreddit=(value:string)=>setReddit((current)=>({...current,subreddits:current.subreddits.includes(value)?current.subreddits.filter((item)=>item!==value):[...current.subreddits,value]}));
  const addCustom=()=>{const value=customSubreddit.trim().replace(/^r\//i,"");if(value&&!reddit.subreddits.includes(value)){toggleSubreddit(value);setCustomSubreddit("")}};

  return <div className="space-y-6">
    <LoadingOverlay open={phase!=="idle"}
      title={phase==="opening"?(editProjectId?"Changes saved":"Project created"):editProjectId?"Saving changes":"Creating your project"}
      description={phase==="uploading"?"Keep this tab open while your video uploads and is hash-checked.":
        phase==="opening"?"Taking you to the project workspace.":"Validating your channel and scheduling the project. This can take a few moments."}
      steps={savingSteps(phase,contentType==="CLIP_UPLOAD"&&Boolean(video),Boolean(editProjectId))}/>
    <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Unified content automation</p>
      <h1 className="mt-2 font-heading text-3xl font-bold">{editProjectId?"Edit Project":"Create Project"}</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">Create niche stories, transformed Reddit stories, or scheduled clip uploads in one shared project system.</p></div>
    <Card className="overflow-hidden"><CardHeader className="border-b border-border/60 bg-muted/20"><CardTitle>Project setup</CardTitle>
      <CardDescription>Only settings relevant to the selected content type are shown.</CardDescription></CardHeader>
      <CardContent className="grid gap-5 pt-6 md:grid-cols-2">
        <div className="space-y-3 md:col-span-2"><Label>Content Type</Label><div className="grid gap-3 md:grid-cols-3">
          {contentTypes.map((item)=><button type="button" key={item.value} onClick={()=>setType(item.value)}
            className={"rounded-control border p-4 text-left transition "+(contentType===item.value?"border-primary bg-primary/10 ring-1 ring-primary":"border-border bg-muted/10 hover:bg-muted/30")}>
            <span className="font-semibold">{item.label}</span><span className="mt-1 block text-xs text-muted-foreground">{item.description}</span></button>)}</div></div>
        <Field label="Project Name" wide><Input value={name} onChange={(event)=>setName(event.target.value)} placeholder="My daily Shorts project" maxLength={120}/></Field>

        {contentType==="FACELESS_NICHE"?<Field label="Select Niche">
          {niches.isPending?<State icon={<Loader2 className="animate-spin"/>} text="Loading niche profiles..."/>:
          niches.isError?<State icon={<AlertTriangle/>} text="Niche profiles could not be loaded." action={<Button type="button" size="sm" variant="outline" onClick={()=>niches.refetch()}><RefreshCw/>Retry</Button>}/>:
          !niches.data?.niches.length?<State icon={<AlertTriangle/>} text="No niche profiles exist." action={<Button type="button" size="sm" onClick={()=>seed.mutate()} disabled={seed.isPending}>{seed.isPending?"Seeding...":"Seed Default Niches"}</Button>}/>:
          <><Select value={nicheId} onChange={(event)=>selectNiche(event.target.value)}><option value="">Choose a niche profile</option>
            {niches.data.niches.map((niche)=><option key={niche.id} value={niche.id}>{niche.name}</option>)}</Select>
            {selectedNiche?<p className="text-xs text-muted-foreground">{selectedNiche.description}</p>:null}</>}</Field>:null}

        {contentType==="REDDIT_STORY"?<RedditFields reddit={reddit} setReddit={setReddit} approved={approved.data??[]} custom={customSubreddit}
          setCustom={setCustomSubreddit} addCustom={addCustom} toggle={toggleSubreddit} loading={approved.isPending} error={approved.isError}/>:null}

        {contentType==="CLIP_UPLOAD"?<ClipFields video={video} setVideo={setVideo} previewUrl={previewUrl} thumbnail={thumbnail}
          setThumbnail={setThumbnail} subtitles={subtitles} setSubtitles={setSubtitles} title={videoTitle} setTitle={setVideoTitle} description={description} setDescription={setDescription}
          hashtags={hashtags} setHashtags={setHashtags}
          privacy={privacy} setPrivacy={setPrivacy} audience={audience} setAudience={setAudience}/>:null}

        <Field label="Assigned YouTube Account"><Select value={accountId} onChange={(event)=>setAccountId(event.target.value)}>
          <option value="">Choose a connected account</option>{channels.data?.map((channel)=>{const locked=contentType==="FACELESS_NICHE"&&Boolean(nicheId)&&!channel.nicheLockExempt&&Boolean(channel.nicheId)&&channel.nicheId!==nicheId;return <option key={channel.id} value={channel.id} disabled={channel.status!=="connected"||locked}>{channel.title} - {channel.externalChannelId}{locked?" — dedicated to another niche":""}</option>})}</Select>
          {accountCheck.isError?<p className="text-xs text-destructive">Account validation failed. Reconnect the account and retry.</p>:null}
          {accountCheck.data&&!accountCheck.data.authenticationActive?<p className="text-xs text-destructive">Authentication is inactive. Refresh this account in Channels.</p>:null}</Field>
        <Field label="Language"><Select value={language} onChange={(event)=>setLanguage(event.target.value)}><option value="en">English</option><option value="fil">Filipino</option><option value="es">Spanish</option></Select></Field>
        {contentType==="CLIP_UPLOAD"?<Field label="Scheduled Upload Date"><Input type="date" min={today} value={scheduleDate} onChange={(event)=>setScheduleDate(event.target.value)}/></Field>:null}
        <Field label="Upload Time"><Input type="time" value={uploadTime} onChange={(event)=>setUploadTime(event.target.value)}/></Field>
        <Field label="Timezone"><Select value={timezone} onChange={(event)=>setTimezone(event.target.value)}>
          {Array.from(new Set([detectedTimezone,"Asia/Manila","UTC","America/New_York","America/Los_Angeles","Europe/London"])).map((zone)=><option key={zone}>{zone}</option>)}</Select></Field>
        {contentType==="FACELESS_NICHE"?<Field label="Visual Type"><Select value={visualType} onChange={(event)=>setVisualType(event.target.value as VisualType)}>
          <option value="AUTO">Auto Select</option><option value="IMAGE">Image Story</option><option value="ANIMATED">Animated Story</option></Select>
          <p className="text-xs text-muted-foreground">{visualType==="IMAGE"?"Generated/licensed images with camera movement and transitions.":visualType==="ANIMATED"?"Motion prompts, animated scenes, graphics, and AI video providers.":"Chooses image or animation from the topic, niche, providers, and visual needs."}</p></Field>:null}
        <Field label={contentType==="CLIP_UPLOAD"?"Approval Mode":"Automation Mode"}><Select value={automationMode} onChange={(event)=>setAutomationMode(event.target.value as AutomationMode)}>
          <option value="approval_before_upload">Approval Before Upload</option><option value="fully_automatic">Fully Automatic</option><option value="draft_only">Draft Only</option></Select></Field>
        <label className="flex items-center gap-3 self-end rounded-control border bg-muted/20 p-4 text-sm"><input type="checkbox" checked={automationEnabled} onChange={(event)=>setAutomationEnabled(event.target.checked)}/>
          <span><span className="block font-semibold">{contentType==="CLIP_UPLOAD"?"Enable automatic clip queue":"Enable daily automation"}</span>
          <span className="text-xs text-muted-foreground">{contentType==="CLIP_UPLOAD"?"Upload the next eligible clip at the configured time.":"Create one unique eligible story per day."}</span></span></label>
        {save.isError?<p className="md:col-span-2 rounded-control border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{save.error instanceof Error?save.error.message:"Project could not be saved."}</p>:null}
        <div className="md:col-span-2 flex justify-end"><Button size="lg" disabled={!valid||save.isPending||phase!=="idle"} onClick={()=>save.mutate()}>
          {save.isPending?<><Loader2 className="animate-spin"/>Saving project...</>:contentType==="CLIP_UPLOAD"?"Create Project & Queue Clip":editProjectId?"Save Changes":"Create Project"}</Button></div>
      </CardContent></Card>
  </div>;
}

function Field({label,wide,children}:{label:string;wide?:boolean;children:React.ReactNode}){return <div className={"space-y-2 "+(wide?"md:col-span-2":"")}><Label>{label}</Label>{children}</div>}
function State({icon,text,action}:{icon:React.ReactNode;text:string;action?:React.ReactNode}){return <div className="flex min-h-10 items-center justify-between gap-3 rounded-control border bg-muted/20 p-3 text-sm"><span className="flex items-center gap-2 text-muted-foreground">{icon}{text}</span>{action}</div>}

function savingSteps(phase:SavePhase,uploadsClip:boolean,editing:boolean):LoadingOverlayStep[]{
  const order:Array<Exclude<SavePhase,"idle">>=uploadsClip?["saving","uploading","opening"]:["saving","opening"];
  const labels:Record<Exclude<SavePhase,"idle">,string>={
    saving:editing?"Saving project changes":"Creating project and validating your channel",
    uploading:"Uploading and hash-checking your clip",
    opening:"Opening the project workspace"};
  const current=order.indexOf(phase as Exclude<SavePhase,"idle">);
  return order.map((key,index):LoadingOverlayStep=>({label:labels[key],state:index===current?"active":index<current?"done":"pending"}));
}

function RedditFields({reddit,setReddit,approved,custom,setCustom,addCustom,toggle,loading,error}:{reddit:RedditConfig;setReddit:React.Dispatch<React.SetStateAction<RedditConfig>>;
  approved:string[];custom:string;setCustom:(value:string)=>void;addCustom:()=>void;toggle:(value:string)=>void;loading:boolean;error:boolean}){
  return <><Field label="Reddit Source Mode"><Select value={reddit.sourceMode} onChange={(event)=>setReddit((value)=>({...value,sourceMode:event.target.value as RedditConfig["sourceMode"]}))}>
    <option value="ONE_SUBREDDIT">One Subreddit</option><option value="MULTIPLE_SUBREDDITS">Multiple Subreddits</option><option value="AUTO">Automatic Subreddit Selection</option></Select></Field>
    <Field label="Reddit Sorting Method"><Select value={reddit.sortMethod} onChange={(event)=>setReddit((value)=>({...value,sortMethod:event.target.value as RedditConfig["sortMethod"]}))}>
      <option value="BEST_ELIGIBLE">Best Eligible Story (Recommended)</option><option value="NEW">New</option><option value="HOT">Hot</option><option value="TOP_TODAY">Top Today</option><option value="TOP_WEEK">Top This Week</option><option value="RISING">Rising</option></Select></Field>
    <div className="space-y-3 md:col-span-2"><Label>Subreddit Selection</Label>{loading?<State icon={<Loader2 className="animate-spin"/>} text="Loading approved subreddits..."/>:
      error?<State icon={<AlertTriangle/>} text="Approved subreddits could not be loaded. You may enter one manually."/>:
      <div className="flex flex-wrap gap-2">{approved.map((item)=><button type="button" key={item} onClick={()=>toggle(item)}
        className={"rounded-full border px-3 py-1.5 text-xs "+(reddit.subreddits.includes(item)?"border-primary bg-primary/15 text-primary":"border-border")}>r/{item}</button>)}</div>}
      <div className="flex gap-2"><Input value={custom} onChange={(event)=>setCustom(event.target.value)} placeholder="Approved subreddit"/><Button type="button" variant="outline" onClick={addCustom}>Add</Button></div>
      {reddit.sourceMode!=="AUTO"&&!reddit.subreddits.length?<p className="text-xs text-destructive">Select at least one subreddit.</p>:null}</div>
    <div className="grid gap-4 md:col-span-2 sm:grid-cols-3"><Field label="Minimum Score"><Input type="number" min={0} value={reddit.minimumScore} onChange={(event)=>setReddit((value)=>({...value,minimumScore:Number(event.target.value)}))}/></Field>
      <Field label="Minimum Comments"><Input type="number" min={0} value={reddit.minimumComments} onChange={(event)=>setReddit((value)=>({...value,minimumComments:Number(event.target.value)}))}/></Field>
      <Field label="Minimum Body Length"><Input type="number" min={80} value={reddit.minimumBodyLength} onChange={(event)=>setReddit((value)=>({...value,minimumBodyLength:Number(event.target.value)}))}/></Field></div>
    <p className="md:col-span-2 rounded-control border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-muted-foreground">Uses the official Reddit API. Pinned, promoted, removed, unsafe, NSFW, low-quality, and previously used posts are filtered before ranking.</p></>;
}

function ClipFields({video,setVideo,previewUrl,thumbnail,setThumbnail,subtitles,setSubtitles,title,setTitle,description,setDescription,hashtags,setHashtags,privacy,setPrivacy,audience,setAudience}:{
  video?:File;setVideo:(value:File|undefined)=>void;previewUrl?:string;thumbnail?:File;setThumbnail:(value:File|undefined)=>void;
  subtitles?:File;setSubtitles:(value:File|undefined)=>void;
  title:string;setTitle:(value:string)=>void;description:string;setDescription:(value:string)=>void;hashtags:string;setHashtags:(value:string)=>void;
  privacy:"private"|"public"|"unlisted";setPrivacy:(value:"private"|"public"|"unlisted")=>void;
  audience:"not_made_for_kids"|"made_for_kids";setAudience:(value:"not_made_for_kids"|"made_for_kids")=>void}){
  return <><div className="space-y-3 md:col-span-2"><Label>Upload Video File</Label><label className="flex cursor-pointer flex-col items-center justify-center rounded-container border border-dashed bg-muted/10 p-6 text-center">
    <Upload className="mb-2 h-6 w-6 text-primary"/><span className="font-semibold">{video?"Replace video":"Choose a local video"}</span><span className="text-xs text-muted-foreground">MP4, MOV, WebM, or MKV. Media is validated and hash-checked.</span>
    <input className="hidden" type="file" accept="video/mp4,video/quicktime,video/webm,video/x-matroska" onChange={(event)=>setVideo(event.target.files?.[0])}/></label>
    {video?<div className="rounded-control border p-3"><p className="mb-2 text-sm font-medium">{video.name}</p>{previewUrl?<video className="max-h-72 w-full rounded-control bg-black" controls src={previewUrl}/>:null}</div>:null}</div>
    <Field label="Optional Thumbnail"><Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event)=>setThumbnail(event.target.files?.[0])}/>{thumbnail?<p className="text-xs text-muted-foreground">{thumbnail.name}</p>:null}</Field>
    <Field label="Optional Subtitles"><Input type="file" accept=".srt,.vtt,text/vtt,application/x-subrip" onChange={(event)=>setSubtitles(event.target.files?.[0])}/>{subtitles?<p className="text-xs text-muted-foreground">{subtitles.name}</p>:null}</Field>
    <Field label="Video Title"><Input value={title} onChange={(event)=>setTitle(event.target.value)} maxLength={100} placeholder="Short video title"/></Field>
    <Field label="Description" wide><Textarea value={description} onChange={(event)=>setDescription(event.target.value)} maxLength={5000}/></Field>
    <Field label="Hashtags" wide><Input value={hashtags} onChange={(event)=>setHashtags(event.target.value)} placeholder="#shorts #story"/></Field>
    <Field label="Privacy Status"><Select value={privacy} onChange={(event)=>setPrivacy(event.target.value as typeof privacy)}><option value="private">Private</option><option value="unlisted">Unlisted</option><option value="public">Public</option></Select></Field>
    <Field label="Audience Setting"><Select value={audience} onChange={(event)=>setAudience(event.target.value as typeof audience)}><option value="not_made_for_kids">Not made for kids</option><option value="made_for_kids">Made for kids</option></Select></Field></>;
}

function zonedDateTime(date:string,time:string,timeZone:string){
  const parts=date.split("-").map(Number);const clock=time.split(":").map(Number);
  let value=Date.UTC(parts[0],parts[1]-1,parts[2],clock[0],clock[1]);
  const formatter=new Intl.DateTimeFormat("en-CA",{timeZone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
  for(let index=0;index<2;index+=1){const mapped=Object.fromEntries(formatter.formatToParts(new Date(value)).map((part)=>[part.type,part.value]));
    const rendered=Date.UTC(Number(mapped.year),Number(mapped.month)-1,Number(mapped.day),Number(mapped.hour),Number(mapped.minute));
    value+=Date.UTC(parts[0],parts[1]-1,parts[2],clock[0],clock[1])-rendered}
  return new Date(value).toISOString();
}
