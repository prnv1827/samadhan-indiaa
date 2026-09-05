import React,{useState} from 'react';
import {
  MapPinIcon,
  UsersIcon,
  HandshakeIcon,
  LightbulbIcon,
  CheckIcon,
  XIcon,
  ImageIcon,
  VideoIcon,
  FilterIcon
} from 'lucide-react';

import {StatusBadge} from '../../components/StatusBadge';
import {Button} from '../../components/ui/Button';
import {useAuth} from '../../contexts/AuthContext';
import {useChallenges} from '../../contexts/ChallengeContext';

export function UniversityDashboard(){

  const{user}=useAuth();

  const{
    all,
    claimForTeam,
    postProgress,
    respondProposal
  }=useChallenges();

  const[team,setTeam]=useState(
    `${user?.organization||'University'} Innovation Team`
  );

  const[solution,setSolution]=useState({
    title:'',
    description:''
  });

  const[note,setNote]=useState('');
  const[busy,setBusy]=useState('');
  const[selectedDomain,setSelectedDomain]=useState('All');

  const approved=all.filter(
    c=>
      c.status==='review' &&
      (!c.teamApplication ||
        c.teamApplication.status==='rejected')
  );

  const filteredApproved=
    selectedDomain==='All'
      ? approved
      : approved.filter(
          c=>c.domain===selectedDomain
        );

  const mine=all.filter(
    c=>c.teamApplication?.contactEmail===user?.email
  );

  const proposals=mine.flatMap(
    c=>
      (c.collaborationProposals||[])
        .filter(p=>p.status==='pending')
        .map(p=>({c,p}))
  );

  const categories=[
    'All',
    ...Array.from(
      new Set(approved.map(c=>c.domain))
    )
  ];

  const claim=async(id:string)=>{

    if(team.trim().length<3){
      alert('Please enter a valid team name.');
      return;
    }

    if(solution.title.trim().length<8){
      alert(
        'Solution title must be at least 8 characters.'
      );
      return;
    }

    if(solution.description.trim().length<30){
      alert(
        'Solution description must be at least 30 characters.'
      );
      return;
    }

    setBusy(id);

    try{

      await claimForTeam(
        id,
        team.trim(),
        {
          title:solution.title.trim(),
          description:solution.description.trim()
        }
      );

      setSolution({
        title:'',
        description:''
      });

    }catch(e){

      alert(
        e instanceof Error
          ?e.message
          :'Could not apply'
      );

    }finally{

      setBusy('');

    }
  };

  const update=async(id:string)=>{

    if(!note.trim())return;

    setBusy(`p-${id}`);

    try{

      await postProgress(
        id,
        note.trim()
      );

      setNote('');

    }catch(e){

      alert(
        e instanceof Error
          ?e.message
          :'Could not post update'
      );

    }finally{

      setBusy('');

    }
  };

  const respond=async(
    id:string,
    pid:string,
    d:'accept'|'reject'
  )=>{

    setBusy(pid);

    try{

      await respondProposal(
        id,
        pid,
        d
      );

    }catch(e){

      alert(
        e instanceof Error
          ?e.message
          :'Could not respond'
      );

    }finally{

      setBusy('');

    }
  };

  return(

    <div>

      {/* HEADER */}

      <header className="max-w-3xl">

        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">
          {user?.organization||'University'} workspace
        </h1>

        <p className="mt-3 text-base text-ink-soft">
          Find approved community challenges by category,
          apply your team with a proposed solution, review
          industry proposals, and work together until the
          Admin verifies completion.
        </p>

      </header>


      {/* TEAM NAME */}

      <section className="mt-10 rounded-card border border-line bg-surface p-5">

        <label className="text-sm font-semibold">
          Team name
        </label>

        <input
          className="mt-2 h-11 w-full rounded-card border border-line px-3 text-sm"
          value={team}
          onChange={e=>setTeam(e.target.value)}
          placeholder="Your university innovation team"
        />

      </section>


      {/* APPROVED CHALLENGES */}

      <section className="mt-10">

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div>

            <h2 className="font-serif text-2xl font-semibold">
              Approved challenges ({filteredApproved.length})
            </h2>

            <p className="mt-1 text-sm text-ink-muted">
              Browse community problems and filter them by domain.
            </p>

          </div>


          {/* CATEGORY FILTER */}

          <div className="flex items-center gap-2">

            <FilterIcon className="h-4 w-4 text-ink-muted"/>

            <select
              value={selectedDomain}
              onChange={e=>
                setSelectedDomain(e.target.value)
              }
              className="h-10 rounded-card border border-line bg-surface px-3 text-sm font-medium"
            >

              {categories.map(category=>(

                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>

              ))}

            </select>

          </div>

        </div>


        {/* CATEGORY QUICK FILTERS */}

        <div className="mt-4 flex flex-wrap gap-2">

          {categories.map(category=>(

            <button
              key={category}
              type="button"
              onClick={()=>
                setSelectedDomain(category)
              }
              className={
                `rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  selectedDomain===category
                    ?'border-forest-700 bg-forest-700 text-white'
                    :'border-line bg-surface text-ink-soft hover:bg-canvas'
                }`
              }
            >
              {category}
            </button>

          ))}

        </div>


        {/* CHALLENGE LIST */}

        <div className="mt-5 space-y-4">

          {filteredApproved.length===0?

            <Empty
              text={
                selectedDomain==='All'
                  ?'No new Admin-approved challenges are waiting for a university team.'
                  :`No approved challenges found in ${selectedDomain}.`
              }
            />

            :

            filteredApproved.map(c=>(

              <article
                key={c.id}
                className="rounded-card border border-line bg-surface p-5"
              >

                {/* CATEGORY */}

                <p className="text-xs font-semibold text-forest-600">
                  {c.domain} · {c.state} · {c.district}
                </p>


                {/* TITLE */}

                <h3 className="mt-1 font-serif text-xl font-semibold">
                  {c.title}
                </h3>


                {/* DESCRIPTION */}

                <p className="mt-2 text-sm text-ink-soft">
                  {c.description}
                </p>


                {/* LOCATION */}

                <p className="mt-3 text-xs text-ink-muted">

                  <MapPinIcon className="mr-1 inline h-3.5 w-3.5"/>

                  {c.city}, {c.state} · {c.supporters} supporters

                </p>


                {/* PROBLEM MEDIA */}

                {c.mediaUrl&&c.mediaType==='image'&&(

                  <div className="mt-5">

                    <div className="mb-2 flex items-center gap-2">

                      <ImageIcon className="h-4 w-4 text-forest-700"/>

                      <span className="text-sm font-semibold">
                        Problem evidence
                      </span>

                    </div>

                    <img
                      src={c.mediaUrl}
                      alt={`Evidence for ${c.title}`}
                      className="max-h-96 w-full rounded-card border border-line object-cover"
                    />

                  </div>

                )}


                {c.mediaUrl&&c.mediaType==='video'&&(

                  <div className="mt-5">

                    <div className="mb-2 flex items-center gap-2">

                      <VideoIcon className="h-4 w-4 text-forest-700"/>

                      <span className="text-sm font-semibold">
                        Problem evidence
                      </span>

                    </div>

                    <video
                      src={c.mediaUrl}
                      controls
                      className="max-h-96 w-full rounded-card border border-line"
                    />

                  </div>

                )}


                {/* APPLICATION + SOLUTION */}

                <div className="mt-5 rounded-card border border-line p-4">

                  <p className="text-sm font-semibold">
                    Apply with your solution
                  </p>

                  <p className="mt-1 text-xs text-ink-muted">
                    Your team must submit a proposed solution
                    together with the team application.
                    Both will be reviewed by Admin.
                  </p>


                  <input
                    className="mt-3 h-10 w-full rounded-card border border-line px-3 text-sm"
                    placeholder="Solution title"
                    value={solution.title}
                    onChange={e=>
                      setSolution({
                        ...solution,
                        title:e.target.value
                      })
                    }
                  />


                  <textarea
                    className="mt-2 min-h-24 w-full rounded-card border border-line px-3 py-2 text-sm"
                    placeholder="What will your team build or do?"
                    value={solution.description}
                    onChange={e=>
                      setSolution({
                        ...solution,
                        description:e.target.value
                      })
                    }
                  />


                  <Button
                    className="mt-3"
                    onClick={()=>claim(c.id)}
                    disabled={busy===c.id}
                  >

                    {busy===c.id
                      ?'Submitting…'
                      :'Apply with solution'}

                  </Button>

                </div>

              </article>

            ))

          }

        </div>

      </section>


      {/* OUR TEAMS & SOLUTIONS */}

      <section className="mt-12">

        <h2 className="font-serif text-2xl font-semibold">
          Our teams & solutions ({mine.length})
        </h2>


        <div className="mt-5 space-y-5">

          {mine.length===0?

            <Empty
              text="Your team applications will appear here."
            />

            :

            mine.map(c=>(

              <article
                key={c.id}
                className="rounded-card border border-line bg-surface p-5"
              >

                <div className="flex flex-wrap justify-between gap-4">

                  <div>

                    <p className="text-xs text-ink-muted">
                      {c.state}, India · {c.domain}
                    </p>

                    <h3 className="mt-1 font-serif text-xl font-semibold">
                      {c.teamApplication?.teamName}
                    </h3>

                    <p className="mt-1 text-sm text-ink-soft">
                      {c.title}
                    </p>

                  </div>

                  <StatusBadge status={c.status}/>

                </div>


                {/* PROBLEM MEDIA */}

                {c.mediaUrl&&c.mediaType==='image'&&(

                  <div className="mt-4">

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Problem evidence
                    </p>

                    <img
                      src={c.mediaUrl}
                      alt={`Evidence for ${c.title}`}
                      className="max-h-80 w-full rounded-card border border-line object-cover"
                    />

                  </div>

                )}


                {c.mediaUrl&&c.mediaType==='video'&&(

                  <div className="mt-4">

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Problem evidence
                    </p>

                    <video
                      src={c.mediaUrl}
                      controls
                      className="max-h-80 w-full rounded-card border border-line"
                    />

                  </div>

                )}


                {/* SOLUTION */}

                <div className="mt-4 rounded-card bg-canvas p-4">

                  <div className="flex items-center gap-2">

                    <LightbulbIcon className="h-4 w-4 text-clay-500"/>

                    <b>Solution</b>

                    <span className="text-xs text-ink-muted">

                      {c.solution
                        ?`· ${c.solution.status}`
                        :'· not submitted yet'}

                    </span>

                  </div>


                  {c.solution&&(

                    <>

                      <h4 className="mt-2 font-semibold">
                        {c.solution.title}
                      </h4>

                      <p className="mt-1 text-sm text-ink-soft">
                        {c.solution.description}
                      </p>

                    </>

                  )}

                </div>


                <p className="mt-3 text-xs text-ink-muted">

                  Team application:{' '}
                  <b>
                    {c.teamApplication?.status}
                  </b>

                  {' · '}

                  Solution:{' '}

                  <b>
                    {c.solution?.status||'not submitted'}
                  </b>

                </p>


                {/* PROGRESS */}

                <div className="mt-4 flex gap-3">

                  <input
                    className="h-10 flex-1 rounded-card border border-line px-3 text-sm"
                    placeholder="Progress update"
                    value={note}
                    onChange={e=>
                      setNote(e.target.value)
                    }
                  />

                  <Button
                    size="sm"
                    onClick={()=>update(c.id)}
                    disabled={
                      busy===`p-${c.id}`||
                      c.teamApplication?.status!=='approved'
                    }
                  >

                    {busy===`p-${c.id}`
                      ?'Posting…'
                      :c.teamApplication?.status==='approved'
                        ?'Post update'
                        :'Awaiting Admin team approval'}

                  </Button>

                </div>

              </article>

            ))

          }

        </div>

      </section>


      {/* INDUSTRY PROPOSALS */}

      <section className="mt-12">

        <h2 className="font-serif text-2xl font-semibold">
          Industry proposals ({proposals.length})
        </h2>


        <div className="mt-5 space-y-4">

          {proposals.length===0?

            <Empty
              text="When an Industry partner likes your approved solution, their proposal will appear here."
            />

            :

            proposals.map(({c,p})=>(

              <article
                key={p.id}
                className="rounded-card border border-line bg-surface p-5"
              >

                <div className="flex items-start gap-3">

                  <HandshakeIcon className="mt-1 h-5 w-5 text-forest-700"/>

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-semibold text-forest-600">
                      {p.company}
                    </p>

                    <h3 className="mt-1 font-serif text-lg font-semibold">
                      Proposal for {c.title}
                    </h3>

                    <p className="mt-2 text-sm text-ink-soft">
                      {p.idea}
                    </p>

                    {p.offer&&(

                      <p className="mt-2 text-sm">
                        <b>Offer:</b> {p.offer}
                      </p>

                    )}

                    {p.bid&&(

                      <p className="mt-1 text-sm">
                        <b>Proposed bid:</b> {p.bid}
                      </p>

                    )}

                    <p className="mt-2 text-xs text-ink-muted">
                      Contact: {p.contactName} · {p.contactEmail}
                    </p>


                    <div className="mt-4 flex gap-2">

                      <Button
                        size="sm"
                        onClick={()=>
                          respond(
                            c.id,
                            p.id,
                            'accept'
                          )
                        }
                        disabled={busy===p.id}
                      >

                        <CheckIcon className="h-4 w-4"/>

                        Accept

                      </Button>


                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={()=>
                          respond(
                            c.id,
                            p.id,
                            'reject'
                          )
                        }
                        disabled={busy===p.id}
                      >

                        <XIcon className="h-4 w-4"/>

                        Reject

                      </Button>

                    </div>

                  </div>

                </div>

              </article>

            ))

          }

        </div>

      </section>

    </div>

  );
}


function Empty({
  text
}:{
  text:string
}){

  return(

    <div className="rounded-card border border-dashed border-line p-10 text-center text-sm text-ink-muted">

      {text}

    </div>

  );

}
