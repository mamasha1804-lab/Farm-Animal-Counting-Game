"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Volume2, VolumeX, RotateCcw, Sparkles, Star, Award } from "lucide-react";

const rounds = [
  { name: "cows", answer: 6, image: "/game/cows-v2.png", points: [[22,32],[50,32],[78,32],[20,72],[50,72],[80,72]] },
  { name: "horses", answer: 9, image: "/game/horses-v2.png", points: [[25,22],[50,22],[75,22],[25,51],[50,51],[75,51],[25,79],[50,79],[75,79]] },
  { name: "pigs", answer: 10, image: "/game/pigs-v2.png", points: [[11,31],[30,31],[50,31],[69,31],[88,31],[11,70],[30,70],[50,70],[69,70],[88,70]] },
  { name: "sheep", answer: 8, image: "/game/sheep-v2.png", points: [[13,30],[38,30],[63,30],[87,30],[13,71],[38,71],[63,71],[87,71]] },
  { name: "ducks", answer: 7, image: "/game/ducks-v2.png", points: [[25,28],[50,28],[75,28],[12,69],[38,69],[63,69],[87,69]] },
  { name: "roosters", answer: 3, image: "/game/roosters-v2.png", points: [[24,55],[50,55],[76,55]] },
  { name: "cats", answer: 5, image: "/game/cats-v2.png", points: [[38,29],[62,29],[24,70],[50,70],[76,70]] },
  { name: "dogs", answer: 4, image: "/game/dogs-v2.png", points: [[17,57],[39,57],[61,57],[83,57]] },
  { name: "frogs", answer: 2, image: "/game/frogs-v2.png", points: [[33,58],[67,58]] },
];

type Screen = "start" | "play" | "finish";

function say(text: string, enabled: boolean) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const britishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en-gb"));
  const preferredNames = ["Sonia", "Serena", "Daniel", "Google UK English Female", "Google UK English Male"];
  utterance.voice = preferredNames.map((name) => britishVoices.find((voice) => voice.name.includes(name))).find(Boolean) ?? britishVoices[0] ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ?? null;
  utterance.lang = "en-GB";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function playVictoryMusic(context: AudioContext) {
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, context.currentTime);
  master.gain.exponentialRampToValueAtTime(0.24, context.currentTime + 0.08);
  master.gain.setValueAtTime(0.24, context.currentTime + 4.25);
  master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 5.1);
  master.connect(context.destination);
  const melody = [
    [392,0,.22],[523.25,.24,.22],[659.25,.48,.25],[783.99,.76,.42],
    [659.25,1.22,.2],[783.99,1.44,.2],[1046.5,1.68,.55],
    [783.99,2.3,.22],[880,2.54,.22],[987.77,2.78,.22],[1046.5,3.04,.75],
  ];
  melody.forEach(([frequency, offset, duration], index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index < 4 ? "square" : "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, context.currentTime + offset);
    gain.gain.exponentialRampToValueAtTime(index < 4 ? 0.12 : 0.2, context.currentTime + offset + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + offset + duration);
    oscillator.connect(gain); gain.connect(master);
    oscillator.start(context.currentTime + offset); oscillator.stop(context.currentTime + offset + duration + 0.05);
  });
  [0, .13, .26, 1.68, 1.82, 1.96, 3.05, 3.2, 3.35, 3.5].forEach((offset, index) => {
    const bell = context.createOscillator();
    const gain = context.createGain();
    bell.type = "sine"; bell.frequency.value = index < 3 ? 1568 : 2093;
    gain.gain.setValueAtTime(0.0001, context.currentTime + offset);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + offset + .015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + offset + .55);
    bell.connect(gain); gain.connect(master); bell.start(context.currentTime + offset); bell.stop(context.currentTime + offset + .6);
  });
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("start");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [sound, setSound] = useState(true);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [activeAnimal, setActiveAnimal] = useState<number | null>(null);
  const [countedUpTo, setCountedUpTo] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);
  const victoryPlayed = useRef(false);
  const round = rounds[index];

  const choices = useMemo(() => {
    const values = new Set<number>([round.answer]);
    let offset = 1;
    while (values.size < 3) {
      const low = Math.max(1, round.answer - offset);
      const high = Math.min(10, round.answer + offset);
      if (low !== round.answer) values.add(low);
      if (values.size < 3 && high !== round.answer) values.add(high);
      offset++;
    }
    return Array.from(values).sort((a, b) => a - b);
  }, [round]);

  useEffect(() => {
    if (screen === "play") say(`Count the ${round.name}. How many are there?`, sound);
  }, [index, screen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (screen !== "finish" || !sound || victoryPlayed.current) return;
    victoryPlayed.current = true;
    const context = audioContext.current;
    if (context) context.resume().then(() => playVictoryMusic(context));
  }, [screen, sound]);

  const start = useCallback(() => {
    if (!audioContext.current && typeof window !== "undefined") audioContext.current = new AudioContext();
    audioContext.current?.resume();
    victoryPlayed.current = false;
    setIndex(0); setScore(0); setPicked(null); setWrong([]); setActiveAnimal(null); setCountedUpTo(0); setScreen("play");
  }, []);

  function choose(value: number) {
    if (picked !== null || countedUpTo < round.answer) return;
    if (value === round.answer) {
      setPicked(value); setScore((s) => s + 1);
      setActiveAnimal(null); setCountedUpTo(0);
      say(index === rounds.length - 1 ? "Great job!" : `Great job! There are ${round.answer} ${round.name}.`, sound);
      window.setTimeout(() => {
        if (index === rounds.length - 1) setScreen("finish");
        else { setIndex((i) => i + 1); setPicked(null); setWrong([]); setActiveAnimal(null); setCountedUpTo(0); }
      }, 1200);
    } else {
      setWrong((items) => [...items, value]);
      say("Try again! Count slowly.", sound);
    }
  }

  function countAnimal(animalIndex: number) {
    if (animalIndex !== countedUpTo) return;
    setActiveAnimal(animalIndex);
    setCountedUpTo((value) => value + 1);
    say(String(animalIndex + 1), sound);
  }

  return (
    <main className="game-shell">
      <div className="cloud cloud-a" /><div className="cloud cloud-b" />
      <div className="twinkles" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>✧</i><i>✦</i><i>✧</i></div>
      <header className="topbar">
        <div className="brand" aria-label="Учимся с Ларисой Коротаевой">
          <span className="brand-mark"><Sparkles /></span>
          <span className="brand-copy"><small>Учимся с</small><strong>Ларисой Коротаевой</strong></span>
        </div>
        <button className="sound" onClick={() => setSound((v) => !v)} aria-label={sound ? "Turn sound off" : "Turn sound on"}>{sound ? <Volume2 /> : <VolumeX />}</button>
      </header>

      {screen === "start" && <section className="start-card">
        <div className="sticker"><Sparkles size={18} /> COUNT 1–10</div>
        <h1>Magical Farm<br /><span>Counting Adventure</span></h1>
        <div className="cover-wrap"><img src="/game/cows-v2.png" alt="Animated farm animals in a sunny meadow" /><div className="cover-badge"><Star fill="currentColor" /> A counting adventure</div></div>
        <button className="primary" onClick={start}><Sparkles size={21} /> START <span>→</span></button>
        <small>9 fun rounds · English listening practice</small>
      </section>}

      {screen === "play" && <section className="play-card">
        <div className="game-status"><span>Round {index + 1} of {rounds.length}</span><div className="score"><Star size={18} fill="currentColor" /> {score}</div></div>
        <Progress value={((index + (picked !== null ? 1 : 0)) / rounds.length) * 100} className="progress" />
        <button className="question" onClick={() => say(`Count the ${round.name}. How many are there?`, sound)}>Count the {round.name}. How many are there? <Volume2 size={22} /></button>
        <div className={`scene count-${round.answer}`}><img src={round.image} alt={`Count the ${round.name}`} />
          <div className="animal-hotspots" aria-label={`Interactive ${round.name}`}>
            {round.points.map(([x,y], animalIndex) => <button
              key={animalIndex}
              className={`${activeAnimal === animalIndex ? "active" : ""} ${animalIndex < countedUpTo ? "counted" : ""} ${animalIndex === countedUpTo ? "next" : ""}`}
              style={{left:`${x}%`,top:`${y}%`}}
              aria-label={`${animalIndex + 1}`}
              onPointerEnter={() => countAnimal(animalIndex)}
              onPointerLeave={() => setActiveAnimal(null)}
              onFocus={() => countAnimal(animalIndex)}
              onClick={() => countAnimal(animalIndex)}
            ><span>{animalIndex + 1}</span></button>)}
          </div>
          {picked !== null && <div className="correct-burst"><span>★</span> Great job!</div>}
        </div>
        <div className="answer-area"><p>Choose the answer</p><div className="answers">
          {choices.map((value) => <button key={value} className={`${picked === value ? "correct" : ""} ${wrong.includes(value) ? "wrong" : ""}`} onClick={() => choose(value)} disabled={picked !== null || countedUpTo < round.answer} aria-label={`Answer ${value}`}>{value}</button>)}
        </div>{countedUpTo < round.answer && <div className="count-first">Count every animal in order to unlock the answers.</div>}{wrong.length > 0 && picked === null && <div className="hint">Almost! Touch each animal and count again.</div>}</div>
      </section>}

      {screen === "finish" && <section className="finish-card">
        <div className="stars">★ ★ ★</div><h1>Magical!</h1><p>You counted every animal and brought a golden star to the farm!</p>
        <div className="medal"><Award /><strong>{score} / {rounds.length}</strong><span>Farm Star</span></div>
        <button className="primary" onClick={start}><RotateCcw size={22} /> Play again</button>
      </section>}
      <div className="grass" />
    </main>
  );
}
