"use client";
import Link from "next/link";
import { useState } from "react";
import { Arrow } from "./icons";

export function StartLesson({ initial, href }: { initial: string; href: string }) {
  const [topic, setTopic] = useState(initial);
  return (
    <div className="topic">
      <label htmlFor="topic" className="visually-hidden">Topic and audience</label>
      <input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
      <Link className="btn btn-primary" href={href}>Start lesson <Arrow /></Link>
    </div>
  );
}
