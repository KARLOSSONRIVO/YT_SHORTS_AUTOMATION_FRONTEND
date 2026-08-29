"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowDown, ArrowUp, CalendarClock, CheckCircle2, Clock3, Edit3, PauseCircle, PlayCircle, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { LoadingOverlay } from "@/components/common/loading-overlay";
import { appRoutes } from "@/lib/constants/routes";
import { approveStory, deleteAutomationProject, generateNow, getProjectDashboard, pauseAutomation, rejectStory,
  removeQueuedClip, reorderQueuedClips, replaceQueuedClip, resumeAutomation, retryGeneration, retryQueuedClip, retryUpload,
  scheduleQueuedClip, uploadQueuedClipNow, uploadStoryNow } from "../api";
import type { QueuedClip, Story } from "../types";

const pretty=(value?:string)=>value?value.replaceAll("_"," ").replace(/\b\w/g,(letter)=>letter.toUpperCase()):"-";
const when=(value?:string)=>value?new Date(value).toLocaleString():"Not yet";
const tone=(status:string):"neutral"|"warning"|"success"|"error"=>status==="uploaded"||status==="active"?"success":status==="failed"||status==="rejected"||status==="error"?"error":status==="paused"||status==="awaiting_approval"?"warning":"neutral";

export function ProjectAutomationDashboard({projectId}:{projectId:string}){
  const router=useRouter(),client=useQueryClient();
  const [deletePhase,setDeletePhase]=useState<"idle"|"deleting"|"redirecting">("idle");
  const dashboard=useQuery({queryKey:["project-dashboard",projectId],queryFn:()=>getProjectDashboard(projectId),refetchInterval:10000});
  const refresh=()=>client.invalidateQueries({queryKey:["project-dashboard",projectId]});
  const run=useMutation({mutationFn:()=>generateNow(projectId),onSuccess:refresh});
  const pause=useMutation({mutationFn:()=>pauseAutomation(projectId),onSuccess:refresh});
  const resume=useMutation({mutationFn:()=>resumeAutomation(projectId),onSuccess:refresh});
  const approve=useMutation({mutationFn:(id:string)=>approveStory(projectId,id),onSuccess:refresh});
  const storyUpload=useMutation({mutationFn:(id:string)=>uploadStoryNow(projectId,id),onSuccess:refresh});
  const reject=useMutation({mutationFn:(id:string)=>rejectStory(projectId,id),onSuccess:refresh});
  const retryGen=useMutation({mutationFn:(id:string)=>retryGeneration(projectId,id),onSuccess:refresh});
  const retryUp=useMutation({mutationFn:(id:string)=>retryUpload(projectId,id),onSuccess:refresh});
  const clipUpload=useMutation({mutationFn:(id:string)=>uploadQueuedClipNow(projectId,id),onSuccess:refresh});
  const clipRetry=useMutation({mutationFn:(id:string)=>retryQueuedClip(projectId,id),onSuccess:refresh});
  const clipRemove=useMutation({mutationFn:(id:string)=>removeQueuedClip(projectId,id),onSuccess:refresh});
  const clipReorder=useMutation({mutationFn:(ids:string[])=>reorderQueuedClips(projectId,ids),onSuccess:refresh});
  const clipReplace=useMutation({mutationFn:(input:{id:string;file:File})=>replaceQueuedClip(projectId,input.id,input.file),onSuccess:refresh});
  const clipSchedule=useMutation({mutationFn:(input:{id:string;scheduledAt:string})=>scheduleQueuedClip(projectId,input.id,input.scheduledAt),onSuccess:refresh});
  const remove=useMutation({mutationFn:()=>deleteAutomationProject(projectId),onMutate:()=>setDeletePhase("deleting"),
    onSuccess:()=>{setDeletePhase("redirecting");router.push(appRoutes.projects)},onError:()=>setDeletePhase("idle")});
  if(dashboard.isError&&deletePhase==="idle")return <div className="rounded-container border border-destructive/40 bg-destructive/5 p-5 text-destructive">Project dashboard could not be loaded. <Button variant="outline" size="sm" onClick={()=>dashboard.refetch()}>Retry</Button></div>;
  if(!dashboard.data)return <p className="text-muted-foreground">Loading project dashboard...</p>;
  const data=dashboard.data,project=data.project;
  const actions=[run,pause,resume,approve,storyUpload,reject,retryGen,retryUp,clipUpload,clipRetry,clipRemove,clipReorder,clipReplace,clipSchedule,remove];
  const actionError=actions.find((item)=>item.isError)?.error;
  const typeLabel=project.contentType==="FACELESS_NICHE"?"Faceless Niche Story":project.contentType==="REDDIT_STORY"?"Reddit Story":"Clip Upload";
  const runLabel=project.contentType==="REDDIT_STORY"?"Fetch Reddit Story Now":project.contentType==="CLIP_UPLOAD"?"Upload Next Clip":"Generate Now";
  const clips=data.clips??[];
  const move=(index:number,direction:number)=>{const target=index+direction;if(target<0||target>=clips.length)return;const ids=clips.map((clip)=>clip.id);[ids[index],ids[target]]=[ids[target],ids[index]];clipReorder.mutate(ids)};
  return <div className="space-y-6">
    <LoadingOverlay open={deletePhase!=="idle"} tone="destructive"
      title={deletePhase==="redirecting"?"Project deleted":"Deleting project"}
      description={deletePhase==="redirecting"?"Taking you back to your projects.":"Removing pending local assets, queued clips, and renders. Published history is preserved."}
      steps={[{label:"Removing project assets and queue",state:deletePhase==="deleting"?"active":"done"},
        {label:"Returning to your projects",state:deletePhase==="redirecting"?"active":"pending"}]}/>
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{typeLabel}</p>
      <h1 className="mt-2 font-heading text-3xl font-bold">{project.title}</h1>
      <p className="mt-2 text-muted-foreground">{project.nicheId?pretty(project.nicheId)+" · ":""}{data.account.channelName+" · "+pretty(project.automationMode)}{project.visualType?" · "+pretty(project.visualType):""}</p></div>
      <div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href={appRoutes.createProject+"?edit="+projectId}><Edit3/>Edit Project</Link></Button>
        <Button variant="destructive" disabled={deletePhase!=="idle"} onClick={()=>{if(window.confirm("Delete this project and pending local assets? Published history is preserved."))remove.mutate()}}><Trash2/>Delete Project</Button></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={<CalendarClock/>} label="Next Scheduled Run" value={when(project.nextRunAt)}/>
      <Metric icon={<CheckCircle2/>} label="Last Successful Run" value={when(data.lastSuccessfulGeneration)}/>
      <Metric icon={<UploadCloud/>} label="Last Upload" value={when(data.lastUpload)}/><Metric icon={<Clock3/>} label="Current Job Status" value={pretty(data.currentJobStatus)}/></div>
    <Card><CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between"><div>
      <div className="flex items-center gap-3"><StatusBadge tone={tone(project.automationStatus)}>{pretty(project.automationStatus)}</StatusBadge><span className="text-sm text-muted-foreground">Daily at {project.uploadTime+" · "+project.timezone}</span></div>
      <p className="mt-2 text-sm text-muted-foreground">Shared scheduler, account, upload history, activity log, and idempotency protections are active for this project.</p></div>
      <div className="flex flex-wrap gap-2"><Button onClick={()=>run.mutate()} disabled={run.isPending||data.currentJobStatus!=="idle"}><PlayCircle/>{run.isPending?"Queuing...":runLabel}</Button>
        {project.automationEnabled?<Button variant="secondary" onClick={()=>pause.mutate()} disabled={pause.isPending}><PauseCircle/>Pause Automation</Button>:
        <Button variant="secondary" onClick={()=>resume.mutate()} disabled={resume.isPending}><PlayCircle/>Resume Automation</Button>}</div></CardContent></Card>
    {actionError?<div className="rounded-container border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">{actionError instanceof Error?actionError.message:"Action failed."}</div>:null}

    {project.contentType==="CLIP_UPLOAD"?<Card><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>Clip Queue</CardTitle>
      <CardDescription>Each file hash can be uploaded only once to the assigned account.</CardDescription></div><Button asChild><Link href={appRoutes.createProject+"?edit="+projectId+"&addClip=1"}>Add Clip</Link></Button></div></CardHeader>
      <CardContent className="space-y-3">{clips.length?clips.map((clip,index)=><ClipRow key={clip.id} clip={clip} first={index===0} last={index===clips.length-1}
        moveUp={()=>move(index,-1)} moveDown={()=>move(index,1)} upload={()=>clipUpload.mutate(clip.id)} retry={()=>clipRetry.mutate(clip.id)}
        remove={()=>clipRemove.mutate(clip.id)} replace={(file)=>clipReplace.mutate({id:clip.id,file})}
        schedule={(scheduledAt)=>clipSchedule.mutate({id:clip.id,scheduledAt})}/>):<Empty text="No clips are queued."/ >}</CardContent></Card>:
    <Card><CardHeader><CardTitle>{project.contentType==="REDDIT_STORY"?"Today’s Reddit Story":"Today’s Story and Upload Status"}</CardTitle>
      <CardDescription>One unique eligible story per project and local day.</CardDescription></CardHeader><CardContent className="space-y-4">{data.stories.length?
      data.stories.map((story)=><StoryCard key={story.id} story={story} account={data.account.channelName} onApprove={()=>approve.mutate(story.id)}
        onUploadNow={()=>storyUpload.mutate(story.id)} uploadNowPending={storyUpload.isPending} onReject={()=>reject.mutate(story.id)}
        onRetryGeneration={()=>retryGen.mutate(story.id)} onRetryUpload={()=>retryUp.mutate(story.id)}/>):<Empty text="No story has been generated today."/ >}</CardContent></Card>}

    {project.contentType==="REDDIT_STORY"?<Card><CardHeader><CardTitle>Reddit Source History</CardTitle><CardDescription>Selected, rejected, transformed, and uploaded source records.</CardDescription></CardHeader>
      <CardContent className="space-y-3">{data.redditSources?.length?data.redditSources.map((source)=><div key={source.id} className="rounded-control border p-4">
        <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{source.originalTitle}</p><a className="text-xs text-primary" href={source.permalink} target="_blank" rel="noreferrer">r/{source.subreddit} source</a></div><StatusBadge tone={tone(source.status)}>{pretty(source.status)}</StatusBadge></div>
        {source.rejectionReason?<p className="mt-2 text-xs text-destructive">{source.rejectionReason}</p>:null}</div>):<Empty text="No Reddit source has been selected yet."/ >}</CardContent></Card>:null}

    {project.contentType!=="CLIP_UPLOAD"?<Card><CardHeader><CardTitle>Rejected Duplicate Topics</CardTitle><CardDescription>Exact, entity, angle, content-hash, and semantic rejections.</CardDescription></CardHeader>
      <CardContent className="space-y-3">{data.rejectedTopics.length?data.rejectedTopics.map((item)=><div key={item.id} className="rounded-control border p-4"><p className="font-semibold">{item.topic}</p><p className="mt-1 text-xs text-muted-foreground">{item.reasons.join(" · ")}</p></div>):<Empty text="No duplicate topics have been rejected yet."/ >}</CardContent></Card>:null}
    <Card><CardHeader><CardTitle>Recent Project Activity</CardTitle><CardDescription>Scheduling, generation, approval, uploads, queue changes, and errors.</CardDescription></CardHeader>
      <CardContent className="space-y-3">{data.activity.length?data.activity.slice(0,12).map((item)=><div key={item.id} className="flex gap-3 rounded-control border p-4">{item.severity==="error"?<AlertTriangle className="text-destructive"/>:<CheckCircle2 className="text-primary"/>}<div><p className="text-sm font-medium">{item.message}</p><p className="text-xs text-muted-foreground">{when(item.createdAt)}</p></div></div>):<Empty text="No activity has been recorded yet."/ >}</CardContent></Card>
    {data.recentErrors.length?<Card className="border-destructive/30"><CardHeader><CardTitle>Recent Errors</CardTitle></CardHeader><CardContent className="space-y-2">{data.recentErrors.map((error,index)=><div key={(error.storyId??error.clipId??"error")+index} className="rounded-control bg-destructive/5 p-3 text-sm text-destructive">{error.message}</div>)}</CardContent></Card>:null}
  </div>;
}

function Metric({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <Card><CardContent className="pt-6"><div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">{icon}{label}</div><p className="mt-3 font-semibold">{value}</p></CardContent></Card>}
function Empty({text}:{text:string}){return <p className="rounded-control border border-dashed p-5 text-sm text-muted-foreground">{text}</p>}
function ClipRow({clip,first,last,moveUp,moveDown,upload,retry,remove,replace,schedule}:{clip:QueuedClip;first:boolean;last:boolean;moveUp:()=>void;moveDown:()=>void;upload:()=>void;retry:()=>void;remove:()=>void;replace:(file:File)=>void;schedule:(value:string)=>void}){
  const [scheduledAt,setScheduledAt]=useState("");
  return <div className="rounded-control border p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold">{clip.title}</p>
    <p className="text-xs text-muted-foreground">{clip.durationSeconds.toFixed(1)+" sec · "+(clip.width??"?")+"x"+(clip.height??"?")+" · "+when(clip.scheduledAt)}</p></div><StatusBadge tone={tone(clip.status)}>{pretty(clip.status)}</StatusBadge></div>
    {clip.error?<p className="mt-2 text-xs text-destructive">{clip.error}</p>:null}<div className="mt-3 flex flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={first||clip.status==="uploaded"} onClick={moveUp}><ArrowUp/>Move Up</Button><Button size="sm" variant="outline" disabled={last||clip.status==="uploaded"} onClick={moveDown}><ArrowDown/>Move Down</Button>
      {["pending","scheduled"].includes(clip.status)?<Button size="sm" onClick={upload}>Upload Now</Button>:null}
      {clip.status==="failed"?<Button size="sm" onClick={retry}><RefreshCw/>Retry Upload</Button>:null}
      {["pending","scheduled","failed","draft"].includes(clip.status)?<><label className="cursor-pointer rounded-control border px-3 py-2 text-xs">Replace File<input className="hidden" type="file" accept="video/*" onChange={(event)=>{const file=event.target.files?.[0];if(file)replace(file)}}/></label>
        <Input className="h-9 w-auto" type="datetime-local" value={scheduledAt} onChange={(event)=>setScheduledAt(event.target.value)}/><Button size="sm" variant="outline" disabled={!scheduledAt} onClick={()=>schedule(new Date(scheduledAt).toISOString())}>Schedule</Button>
        <Button size="sm" variant="destructive" onClick={remove}>Remove</Button></>:null}</div></div>;
}
function StoryCard({story,account,onApprove,onUploadNow,uploadNowPending,onReject,onRetryGeneration,onRetryUpload}:{story:Story;account:string;onApprove:()=>void;onUploadNow:()=>void;uploadNowPending:boolean;onReject:()=>void;onRetryGeneration:()=>void;onRetryUpload:()=>void}){
  const youtubeUrl=story.platformUrl??(story.platformVideoId?`https://www.youtube.com/watch?v=${story.platformVideoId}`:undefined);
  return <div className="rounded-control border p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{story.title}</h3><p className="text-sm text-muted-foreground">{story.topic}</p></div><StatusBadge tone={tone(story.status)}>{pretty(story.status)}</StatusBadge></div>
    <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3"><Detail label="Narrative Format" value={pretty(story.storyFormat)}/><Detail label="Assigned Account" value={story.metadata?.assignedAccount??account}/><Detail label="Scheduled Upload" value={when(story.scheduledUploadTime)}/></div>
    {youtubeUrl?<a className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline" href={youtubeUrl} target="_blank" rel="noreferrer">Open on YouTube</a>:null}
    {story.lastError?<p className="mt-3 text-sm text-destructive">{story.lastError}</p>:null}<div className="mt-4 flex gap-2">{story.status==="scheduled"&&story.scheduledUploadTime?<Button size="sm" onClick={onUploadNow} disabled={uploadNowPending}><UploadCloud/>{uploadNowPending?"Uploading...":"Upload Now"}</Button>:null}{story.status==="awaiting_approval"?<><Button size="sm" onClick={onApprove}>Approve and Upload</Button><Button size="sm" variant="outline" onClick={onReject}>Reject</Button></>:null}
      {story.status==="failed"?(story.uploadAttempts??0)>0?<Button size="sm" onClick={onRetryUpload}>Retry Upload</Button>:<Button size="sm" onClick={onRetryGeneration}>Retry Generation</Button>:null}</div></div>;
}
function Detail({label,value}:{label:string;value:string}){return <div className="rounded-control bg-muted/40 p-3"><span className="text-muted-foreground">{label}</span><p className="mt-1 font-medium">{value}</p></div>}
