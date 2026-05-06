# ⚔️ IMPERIUS RPG v2.0

Bot de RPG para WhatsApp com sistema completo de classes, batalhas, sacrifícios e encarnação divina.

---

## 🚀 INSTALAÇÃO

```bash
npm install
```

---

## ⚙️ CONFIGURAÇÃO

Antes de rodar, abra o `index.js` e troque a linha:

```js
const DONO_ID = process.env.DONO_ID || '5511999999999@s.whatsapp.net';
```

Pelo seu número no formato: `55DDDNÚMERO@s.whatsapp.net`

Ex: `5511987654321@s.whatsapp.net`

---

## ▶️ COMO RODAR

```bash
node index.js
```

Escaneie o QR code que aparecer no terminal com o WhatsApp.

---

## 📂 ESTRUTURA

```
imperius-bot/
├── index.js              ← Bot principal (comandos)
├── package.json
├── data/
│   └── gameData.js       ← Todas as classes, regiões, armas, itens
├── systems/
│   ├── db.js             ← Banco de dados SQLite
│   ├── character.js      ← Personagem, ficha, roleta
│   ├── combat.js         ← Batalha, boss, PvP, habilidades
│   ├── death.js          ← Morte, ressurreição, necromância
│   ├── economy.js        ← Loja, banco, itens
│   ├── events.js         ← Ranking, missões, comandos do dono
│   ├── sacrifice.js      ← Sistema de sacrifício
│   └── incarnation.js    ← Encarnação divina
└── auth_info_baileys/    ← Criado automaticamente na primeira conexão
```

---

## 🎮 SISTEMAS

### 20 Classes Normais (/criar)
Guerreiro, Mago, Assassino, Caçador, Curandeiro, Bardo, Necromante, Paladino, Arqueiro, Monge, Espadachim, Invocador, Alquimista, Berserker, Samurai, Ninja, Druida, Caçador de Demônios, Vidente, Bombardeiro

### 11 Classes Raras (/roleta)
Vampiro, Sombra, Trovejante, Dragomante, Espectro, Maré, Meteoromante, Serafim, Herói Caído, Artificer, Portador do Caos

Cada classe rara tem:
- Lore exclusiva
- Poder especial único que classes normais não possuem

### Sistema de Sacrifício
- `/sacrificio [oferta] | [pedido]`
- Pode sacrificar: moedas, itens, XP, partes do corpo, outro jogador
- Dono aceita ou recusa — a oferta é cobrada de qualquer jeito

### Encarnação Divina
- `/encarnar [nome]` — Dono vira jogador comum, sem poderes
- `/ascender` — Volta como Deus, personagem morre
- Se morrer em batalha: volta como Deus automaticamente
- Quem matar o Deus encarnado ganha título **Deicida** + arma Primordial

### Banco de Dados
- SQLite com WAL mode (estável, sem corrupção)
- Backup automático a cada 30 minutos
- 3 backups mais recentes mantidos

---

## 👑 COMANDOS DO DONO

| Comando | Descrição |
|---------|-----------|
| `/matar @jogador` | Mata o jogador |
| `/dar @jogador [item]` | Dá item ao jogador |
| `/abencoar @jogador` | Restaura HP/Mana, +500 moedas |
| `/maldicoar @jogador` | Reduz HP/Mana/Moedas |
| `/evento [mensagem]` | Evento global |
| `/aceitarsacrificio @jogador [recompensa]` | Aceita sacrifício |
| `/recusarsacrificio @jogador` | Recusa sacrifício |
| `/encarnar [nome]` | Encarna como jogador |
| `/ascender` | Volta a ser Deus |
| `/status` | Status do servidor |

---

## ⚠️ IMPORTANTE

O bot só responde em grupos.
Certifique-se de adicionar o número do bot no grupo antes de usar.
