# Permanent geheugen voor app

state = {
    "votes": {},
    "used_ai": [],
    "last_ai": None,
    "questions": ["Wie heeft de gekste familie?", "Wie zou er het best voor een zwijn kunnen zorgen?", "Wie heeft er als eerste ‘ik zie je graag’ gezegd?", "Wie geeft er het meeste geld uit?", "Wie is de meeste creatieve?", "Wie zou het snelst uit zijn comfort zone gaan om de ander te verassen?", "Wie heeft als eerste voorgesteld om seks te hebben op een openbare plaats?", "Van wie hebben de kinderen de meeste eigenschappen?", "Wie heeft de ander verleid?", "Wie doet er het meest aan ‘dirty talk’ in de slaapkamer?", "Wie van de twee lijkt het meest op zijn/haar respectievelijke vader/moeder?", "Wie doet de ander het meeste lachen?"]
}

def reset_votes():
    state["votes"] = {}
