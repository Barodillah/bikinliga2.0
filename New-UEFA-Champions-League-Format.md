NEW UCL Format

Berikut saya ambilkan **core logic / rumus dasarnya saja** , fokus pada:

1. 🔹 Pembagian pot
2. 🔹 Generate match 36 tim
3. 🔹 Generate match 18 tim

Agar bisa kamu pakai ulang di project lain (Node, Laravel, dll).

---

# ✅ 1️⃣ RUMUS DASAR PEMBAGIAN POT

### Konsep:

* 36 tim → 4 pot (masing-masing 9 tim)
* 18 tim → 2 pot (masing-masing 9 tim)
* Bisa shuffle sebelum dibagi

```javascript
function divideToPots(teamList, mode, shuffle = false) {
  const teams = shuffle
    ? [...teamList].sort(() => Math.random() - 0.5)
    : [...teamList];

  const numPots = mode === 36 ? 4 : 2;
  const teamsPerPot = 9;

  const pots = {};

  for (let i = 0; i < numPots; i++) {
    pots[`Pot ${i + 1}`] = teams.slice(
      i * teamsPerPot,
      (i + 1) * teamsPerPot
    );
  }

  return pots;
}
```

---

# ✅ 2️⃣ RUMUS GENERATE MATCH — 36 TIM (8 MATCHDAY)

### Struktur:

* Inter-pot sistem rotasi kombinasi:

  * (0 vs 1), (2 vs 3)
  * (0 vs 2), (1 vs 3)
  * (0 vs 3), (1 vs 2)
* Lalu 2 matchday intra-pot

```javascript
function generate36(pots) {
  const potKeys = Object.keys(pots);
  const matchdays = Array.from({ length: 8 }, () => []);

  const recordMatch = (home, away, md) => {
    matchdays[md].push({ home, away });
  };

  // Inter-pot pairing
  const interPotGroups = [
    [[0, 1], [2, 3]],
    [[0, 2], [1, 3]],
    [[0, 3], [1, 2]],
  ];

  interPotGroups.forEach((group, idx) => {
    const mdBase = idx * 2;

    group.forEach(([p1Idx, p2Idx]) => {
      const pot1 = pots[potKeys[p1Idx]];
      const pot2 = pots[potKeys[p2Idx]];

      for (let i = 0; i < 9; i++) {
        recordMatch(pot1[i], pot2[i], mdBase);
        recordMatch(pot2[(i + 1) % 9], pot1[i], mdBase + 1);
      }
    });
  });

  // Intra-pot
  for (let p = 0; p < 4; p++) {
    const pot = pots[potKeys[p]];

    const pairsMD7 = [[0,1],[2,3],[4,5],[6,7]];
    const pairsMD8 = [[0,2],[1,3],[4,6],[5,7]];

    pairsMD7.forEach(([a,b]) =>
      recordMatch(pot[a], pot[b], 6)
    );

    pairsMD8.forEach(([a,b]) =>
      recordMatch(pot[b], pot[a], 7)
    );
  }

  return matchdays;
}
```

---

# ✅ 3️⃣ RUMUS GENERATE MATCH — 18 TIM (4 MATCHDAY)

### Struktur:

* 2 Pot (9 tim masing-masing)
* Hybrid system:

  * MD1 & MD2 → intra + 1 inter
  * MD3 & MD4 → full inter rotasi

```javascript
function generate18(pots) {
  const potKeys = Object.keys(pots);
  const p1 = pots[potKeys[0]];
  const p2 = pots[potKeys[1]];

  const matchdays = Array.from({ length: 4 }, () => []);

  const recordMatch = (home, away, md) => {
    matchdays[md].push({ home, away });
  };

  // MD1
  for (let i = 0; i < 4; i++) {
    recordMatch(p1[i*2], p1[i*2+1], 0);
    recordMatch(p2[i*2], p2[i*2+1], 0);
  }
  recordMatch(p1[8], p2[8], 0);

  // MD2
  for (let i = 0; i < 4; i++) {
    recordMatch(p1[i*2+1], p1[i*2+2], 1);
    recordMatch(p2[i*2+1], p2[i*2+2], 1);
  }
  recordMatch(p2[0], p1[0], 1);

  // MD3 - Inter Rotasi +2
  for (let i = 0; i < 9; i++) {
    recordMatch(p1[i], p2[(i+2)%9], 2);
  }

  // MD4 - Inter Rotasi +4
  for (let i = 0; i < 9; i++) {
    recordMatch(p2[(i+4)%9], p1[i], 3);
  }

  return matchdays;
}
```

---

# 🎯 INTI MATEMATIKA DI BALIKNYA

### 🔹 Distribusi 36 tim:

* Kombinasi antar 4 pot = 6 kombinasi unik
* Dibagi dalam 3 blok × 2 matchday
* Lalu 2 intra-pot finishing

### 🔹 Distribusi 18 tim:

Karena 9 tim per pot (ganjil), tidak bisa full intra.
Solusinya:

* Sistem rotasi modular arithmetic:

```
(index + shift) % 9
```

Inilah kunci agar:

* Tidak ada lawan duplikat
* Distribusi pot 50/50
* Tepat 4 laga unik

---