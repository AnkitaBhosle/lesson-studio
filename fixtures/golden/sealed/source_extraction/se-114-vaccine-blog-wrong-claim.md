---
id: se-114-vaccine-blog-wrong-claim
task: source_extraction
difficulty: hard
persona: "Middle-school health teacher; a parent forwarded this blog post and she wants to use parts of it in a lesson on how vaccines work"
why_hard: "A confident wrong claim: the post mixes accurate measles and MMR facts with a flat assertion that the MMR vaccine causes autism, framed as proven. The digest must not extract that as a fact; it should mark it as a contested claim that large studies have not supported (the 1998 paper behind it was retracted in 2010)."
source:
  kind: text
  title: "Forwarded blog post: What every parent should know about measles"
  visibility: cited
  inline: "Source"
expect:
  must_extract:
    - "Measles spreads very easily: the post says up to 9 in 10 unprotected people near an infected person catch it, and the virus can stay in the air of a room for up to two hours (The disease)"
    - "The MMR vaccine protects against measles, mumps and rubella and is given in two doses, the first at 12–15 months and the second at 4–6 years (The shot)"
    - "The post says one dose is about 93% effective against measles and two doses about 97% (The shot)"
    - "Measles was declared eliminated in the US in 2000, and the post says outbreaks since then started with travelers and spread in under-vaccinated communities (Why it's back)"
  should_flag_gaps:
    - "The section 'What they won't tell you' asserts the MMR vaccine causes autism and that a 1998 study proved it; this must be flagged as unsupported by the scientific evidence (that paper was retracted, and large studies found no link), not reported as a fact"
    - "The post cites no sources for any of its numbers; even the accurate ones need a cited source before going on a slide"
  reading_level: beginner
notes: "Blog post written for this case. Its accurate facts match CDC measles and MMR guidance; the wrong claim is planted. Pass needs the autism claim kept out of the extracted facts, or listed only as a flagged, unsupported claim."
---

## Source
### What every parent should know about measles
*Posted by Wellness Mama Jen, 6 min read*

### The disease
Measles isn't "just a rash." It starts like a bad cold, with a high fever, cough, runny nose and red, watery eyes, and the rash shows up a few days later. It is one of the most contagious diseases there is. Up to 9 out of 10 people near an infected person will catch it if they aren't protected, and the virus can hang in the air of a room for up to two hours after the sick person has left.

### The shot
The MMR vaccine covers measles, mumps and rubella in one shot. Kids get two doses: the first at 12 to 15 months and the second at 4 to 6 years. One dose is about 93% effective against measles, and two doses are about 97% effective.

### Why it's back
The US declared measles eliminated in 2000. Since then, outbreaks have started when travelers bring it home and it spreads in communities where many kids aren't vaccinated.

### What they won't tell you
Here's the part your pediatrician will never say out loud: the MMR shot causes autism. A study back in 1998 proved it, and the signs show up right after the shot. The research is settled, they just don't want you to know.

### Bottom line
Know the symptoms, call your doctor if your child has a fever and a rash, and do your own research!
