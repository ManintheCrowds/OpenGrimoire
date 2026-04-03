# Subnet strategic atlas (Bittensor)

**Status:** Internal strategy research. **Not** financial, legal, or investment advice. **Speculation** is labeled.

**Snapshot:** 2026-04-02 UTC (metadata from [tensorplex-labs/subnet-docs](https://github.com/tensorplex-labs/subnet-docs) `subnet.json` per netuid; **verify** active registration and parameters on [Taostats subnets](https://taostats.io/subnets) or your Subtensor node).

**API caveat:** Programmatic access via [bittensor.ai/docs](https://bittensor.ai/docs) is **not** guaranteed stable; treat explorer and on-chain reads as authoritative for live numbers ([BITTENSOR_EVALUATION.md](./BITTENSOR_EVALUATION.md)).

---

## Executive summary

This atlas extends [BITTENSOR_EVALUATION.md](./BITTENSOR_EVALUATION.md): **Subtensor** coordinates **subnets**; **Taoflow** allocates network TAO to subnets from **net staking flows**; **Yuma Consensus** turns validator weight matrices into intra-subnet emissions. Use this document to **compare subnets**, map **measurable objectives** to **skills and lanes**, and produce **placement guidance** for a team that cares about **local-first product** (OpenGrimoire / agent stack) versus **on-chain participation**.

The master table lists **netuid 1–128** with names and GitHub links where the ecosystem documentation repo provides them. **Not every folder implies an active or healthy subnet**—empty `subnet.json` fields appear for early or placeholder netuids. **Always reconcile** with a block explorer before committing hardware or stake.

**Lanes (recap):** (1) stake/delegate, (2) mine, (3) validate, (4) subnet-adjacent product, (5) alpha/liquidity—see evaluation §2. **Lane 4** is often the best fit for teams building **off-chain** agent products that *consume* subnet outputs without winning on-chain weight games.

**Taoflow awareness:** Technical merit on a subnet does not guarantee network-level TAO injection if **staking flows** to that subnet are weak—see [emissions](https://docs.bittensor.com/emissions).

**Root / netuid 0:** Historically the root network; **Dynamic TAO** changes deprecated the old root-weight model—use current emissions docs rather than legacy blog explanations.

**Network placement:** §4 maps **ML, infra, GTM, research, and capital** roles to example subnets and **lanes** (1–5), with a **gap** column (one hire, partner, or training that most improves *credible* participation—not generic career advice).

**Lane 1 nuance:** Delegation can target **root** vs **subnet-alpha** positions; mechanics and risk sit in official wallet/emissions docs ([dTAO guide](https://docs.bittensor.com/dynamic-tao/dtao-guide)). §4.1 restates this as **informational only**—not allocation advice.

---

## 1. Taxonomy (strategic buckets and tags)

### 1.1 Strategic buckets (assign 2–3 per subnet)

| Bucket | Typical measurable work |
|--------|-------------------------|
| inference | Low-latency LLM or multimodal API serving; verified inference |
| training | Pretraining, finetuning, distributed training, AutoML |
| data_labeling | Scraping, synthetic data, human labeling, dataset QA |
| finance | Trading signals, DeFi, liquidity, lending, synthetic prices |
| science | Bio/chem/weather/materials; protein; drug discovery |
| prediction_gaming | Forecasts, sports, markets, benchmarks-as-game |
| agents_security | Software agents, code gen, pentest, vulnerability finding |
| infra_compute | GPU marketplaces, storage, VPN, RPC, scheduling |
| coordination_gtm | Sales leads, reviews, OTC, identity—human-in-loop markets |
| general_ai | Catch-all when overlap is weak—tighten after reading subnet repo |

### 1.2 Tags

| Tag | Values | Meaning |
|-----|--------|---------|
| Maturity | experimental / established / unverified | Repo+docs quality vs early/empty |
| Capital intensity | high_hw_or_stake / moderate_stake / variable | GPUs, bonds, registration |
| Measurement clarity | documented_repo / partial / opaque | How clear is the validator objective in public artifacts |

---

## 2. Master inventory (netuid 1–128)

Sources: **primary** [tensorplex-labs/subnet-docs](https://github.com/tensorplex-labs/subnet-docs) (community-maintained; also used by Backprop). **Secondary** for browsing: [Taostats subnets](https://taostats.io/subnets). **GitHub** field = first public repo listed, or blank = docs-only/unverified in tensorplex.

| netuid | Canonical name | One-line purpose (from subnet.json summary) | Primary GitHub | Verification |
|--------|----------------|---------------------------------------------|----------------|--------------|
| 1 | Apex | This Subnet defines an incentive mechanism to create a distributed conversational AI. | https://github.com/macrocosm-os/apex | tensorplex `subnet.json` |
| 2 | DSperse | Subnet 2 represents a significant stride in enhancing the Bittensor network, aiming to create the world's largest pee… | https://github.com/inference-labs-inc/subnet-2 | tensorplex `subnet.json` |
| 3 | Templar | Incentivized Wide-Internet Training. | https://github.com/tplr-ai/templar | tensorplex `subnet.json` |
| 4 | Targon | TARGON (Bittensor Subnet 4) is a redundant deterministic verification mechanism that can be used to interpret and ana… | https://github.com/manifold-inc/targon | tensorplex `subnet.json` |
| 5 | Hone | Hierarchical AI Pretraining | https://github.com/manifold-inc/hone | tensorplex `subnet.json` |
| 6 | Numinous | Numinous (Subnet 6) is a forecasting protocol whose goal is to aggregate agents into superhuman LLM forecasters. The … | https://github.com/numinouslabs/numinous | tensorplex `subnet.json` |
| 7 | Subnet 7 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 8 | Vanta Network | Vanta Network incentivizes the contribution of profitable trading strategies across various financial markets. Contri… | https://github.com/taoshidev/vanta-network | tensorplex `subnet.json` |
| 9 | IOTA | Incentivized Orchestrated Training Architecture (IOTA) is a framework for pretraining large language models across a … | https://github.com/macrocosm-os/IOTA | tensorplex `subnet.json` |
| 10 | Swap | Swap (SN10 on Bittensor) incentivizes miners to provide liquidity to the TAO<>USDC pool on TaoFi. Miners are scored b… | https://github.com/Swap-Subnet/swap-subnet | tensorplex `subnet.json` |
| 11 | TrajectoryRL | Agentic RL as a Service, Optimize agent trajectories to make agents cheaper, safer, and more reliable. | https://github.com/trajectoryRL/trajectoryRL | tensorplex `subnet.json` |
| 12 | Compute Horde | Compute Horde is a specialized subnet (subnet 12) within the Bittensor network, designed to provide scalable, decentr… | https://github.com/backend-developers-ltd/ComputeHorde | tensorplex `subnet.json` |
| 13 | Data Universe | Macrocosmos Data Universe is a large-scale, open-access platform that scrapes and aggregates real-time and historical… | https://github.com/macrocosm-os/data-universe/ | tensorplex `subnet.json` |
| 14 | TAO Hash | The first and leading subnet for decentralizing PoW (proof-of-work) mining hashrate, rental and exchange. Validators … | https://github.com/latent-to/taohash | tensorplex `subnet.json` |
| 15 | Subnet 15 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 16 | BitAds | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 17 | 404—GEN | Three Gen incentivizes the development of AI models for generating 3D digital assets and the creation of synthetic 3D… | https://github.com/404-Repo/three-gen-subnet/ | tensorplex `subnet.json` |
| 18 | Zeus | The Zeus Subnet leverages advanced AI models within the Bittensor network to forecast environmental data. This platfo… | https://github.com/Orpheus-AI/Zeus | tensorplex `subnet.json` |
| 19 | blockmachine | Blockmachine is a Bittensor subnet under active development, aiming to provide production-grade infrastructure with a… | https://github.com/taostat/blockmachine | tensorplex `subnet.json` |
| 20 | GroundLayer | Structured OTC deals for subnet tokens. | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 21 | OMEGA inc: The Awakening | Proto-limb for emerging superintelligence. | https://github.com/OMEGAlabsinc/OMEGAlabs-anytoany-bittensor | tensorplex `subnet.json` |
| 22 | Desearch | Welcome to Desearch, the AI-powered search engine built on Bittensor. Designed for the Bittensor community and genera… | https://github.com/Datura-ai/desearch | tensorplex `subnet.json` |
| 23 | Trishool | A Bittensor subnet for evaluating and detecting behavioral traits in Large Language Models (LLMs). This system create… | https://github.com/TrishoolAI/trishool-subnet | tensorplex `subnet.json` |
| 24 | Quasar | Quasar is a Bittensor subnet (Subnet 24) designed to overcome the long-context limitation in AI models by enabling ef… | https://github.com/SILX-LABS/QUASAR-SUBNET/ | tensorplex `subnet.json` |
| 25 | Mainframe | Powering decentralized science on Bittensor | https://github.com/macrocosm-os/mainframe | tensorplex `subnet.json` |
| 26 | kinitro | Advancing Embodied Intelligence With Directed Incentives | https://github.com/threetau/kinitro | tensorplex `subnet.json` |
| 27 | Nodexo | Nodexo Compute (Subnet 27) is a decentralized platform that enables a trustless GPU compute marketplace, allowing ind… | https://github.com/neuralinternet/compute-subnet | tensorplex `subnet.json` |
| 28 | Subnet 28 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 29 | Coldint | AI Agent Safety&Security Specialist Subnet | https://github.com/coldint/sn29 | tensorplex `subnet.json` |
| 30 | Pending | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 31 | Subnet 31 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 32 | It's AI | It's AI incentivizes the development of systems that can identify LLM-generated content. | https://github.com/It-s-AI/llm-detection | tensorplex `subnet.json` |
| 33 | ReadyAI | ReadyAI is focused on data structuring, incentivizing the transformation of unstructured data from sources like video… | https://github.com/afterpartyai/bittensor-conversation-genome-project | tensorplex `subnet.json` |
| 34 | BitMind | BitMind is focused on detecting AI-generated media. Contributors are incentivized to create advanced models that can … | https://github.com/BitMind-AI/bitmind-subnet | tensorplex `subnet.json` |
| 35 | Cartha (0xMarkets) | 0xmarkets is a decentralized exchange (DEX) platform designed to provide global, permissionless access to trading a w… | https://github.com/General-Tao-Ventures/cartha-cli | tensorplex `subnet.json` |
| 36 | Web Agents | Web Agents Subnet leverages our Infinite Web Arena (IWA) benchmark to incentivize Bittensor miners to develop SOTA we… | https://github.com/autoppia/autoppia_web_agents_subnet | tensorplex `subnet.json` |
| 37 | Aurelius | Aurelius transforms alignment into an adversarial, incentive-driven process. Rather than trusting centralized judgmen… | https://github.com/Aurelius-Protocol | tensorplex `subnet.json` |
| 38 | colosseum | Tao Colosseum is a decentralized peer-to-peer betting protocol built on the Bittensor EVM, featuring an 'underdog' ga… | https://github.com/TAO-Colosseum/tao-colosseum-subnet | tensorplex `subnet.json` |
| 39 | basilica | Basilica is a decentralized GPU compute marketplace built on the Bittensor network. It creates a trustless environmen… | https://github.com/tplr-ai/basilica | tensorplex `subnet.json` |
| 40 | Chunking | Chunking incentivizes miners to break large documents into semantically coherent, optimally-sized text chunks for use… | https://github.com/VectorChat/chunking_subnet | tensorplex `subnet.json` |
| 41 | Almanac | Almanac, powered by the Sportstensor subnet on Bittensor, is an incentivized information layer for prediction markets… | https://github.com/sportstensor/sn41 | tensorplex `subnet.json` |
| 42 | Gopher | A Layer-1 for the AI data economy. Access AI-ready data on demand. The fastest & simplest way to scrape and stream da… | https://github.com/gopher-lab/subnet-42 | tensorplex `subnet.json` |
| 43 | Graphite | Graphite focuses on graph problems, which involve optimizing algorithms to solve computational challenges, such as fi… | https://github.com/GraphiteAI/Graphite-Subnet | tensorplex `subnet.json` |
| 44 | Score Vision | Score Vision is a decentralised computer vision framework built on Bittensor that drastically reduces the cost and ti… | https://github.com/score-technologies/score-vision/ | tensorplex `subnet.json` |
| 45 | Talisman AI | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 46 | RESI | Building the world's largest open real estate database through decentralized intelligence | https://github.com/resi-labs-ai/resi | tensorplex `subnet.json` |
| 47 | EvolAI | Reboot Subnet – Robotics AI Network is a specialized Bittensor subnet for decentralized, AI-powered robotics services… | https://github.com/reboot-org/reboot-subnet | tensorplex `subnet.json` |
| 48 | Quantum Compute | Quantum Compute (SN48) is a Bittensor subnet focused on democratizing access to quantum computing, creating an open m… | https://github.com/qbittensor-labs/quantum | tensorplex `subnet.json` |
| 49 | Nepher | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 50 | Synth | Synth creates the world's most powerful Synthetic price data for DeFi, enabling a paradigm shift in how agents model … | https://github.com/mode-network/synth-subnet | tensorplex `subnet.json` |
| 51 | lium.io | This project enables a decentralized, peer-to-peer GPU rental marketplace, connecting miners who contribute GPU resou… | https://github.com/Datura-ai/lium-io | tensorplex `subnet.json` |
| 52 | Tensorplex Dojo | Tensorplex Dojo Subnet is an open platform designed to crowdsource high-quality human-generated datasets. Powered by … | https://github.com/tensorplex-labs/dojo | tensorplex `subnet.json` |
| 53 | Efficient Frontier | Efficient Frontier is a project initiated by SignalPlus and Bittensor, designed to identify the optimal risk-weighted… | https://github.com/EfficientFrontier-SignalPlus/EfficientFrontier | tensorplex `subnet.json` |
| 54 | MIID | MIID (Multimodal Inorganic Identity Dataset) is a next-generation identity testing and identity data generation subne… | https://github.com/yanez-compliance/MIID-subnet | tensorplex `subnet.json` |
| 55 | NIOME | NIOME is a decentralized AI subnet that enables privacy-safe genomic intelligence by replacing real human genomes wit… | https://github.com/genomesio/subnet-niome | tensorplex `subnet.json` |
| 56 | Gradients | On Gradients, Train SOTA Artificial Intelligence Models in a few clicks. The world's best AutoML platform. | https://github.com/rayonlabs/G.O.D | tensorplex `subnet.json` |
| 57 | Sparket.AI | Sparket.ai is a decentralized prediction infrastructure focused on sports and live events, operating as the first Bit… | https://github.com/sparket-ai/sparket-ai | tensorplex `subnet.json` |
| 58 | Handshake | Trustless micropayments for autonomous AI agent | https://github.com/Handshake58/HS58 | tensorplex `subnet.json` |
| 59 | Babelbit | Developing low-latency speech-to-speech translation on Bittensor | https://github.com/babelbit/babelbit_subnet | tensorplex `subnet.json` |
| 60 | Bitsec | Bitsec is an Ecosystem for AI-powered code vulnerability detection. Initially it will help other Bittensor Subnet own… | https://github.com/Bitsec-AI/subnet | tensorplex `subnet.json` |
| 61 | Redteam | At RedTeam, we're creating a hub for ethical hacking and amplifying the collective intelligence of a unique community… | https://github.com/RedTeamSubnet/RedTeam | tensorplex `subnet.json` |
| 62 | Ridges AI | Hire specialized software agents to do tasks in your codebase. AI agents that work out of the box at solving tasks li… | https://github.com/ridgesai/ridges | tensorplex `subnet.json` |
| 63 | Quantum Innovate | Quantum Innovate (SN63) is a Bittensor subnet dedicated to fostering innovation in quantum computing algorithm execut… | https://github.com/qbittensor-labs/quantum | tensorplex `subnet.json` |
| 64 | Chutes | Chutes provides true serverless, permissionless, decentralized, affordable compute to the world. Run any available mo… | https://github.com/rayonlabs/chutes-miner | tensorplex `subnet.json` |
| 65 | TAO Private Network | TPN is a decentralized subnet designed to empower secure, private, and geographically diverse internet access through… | https://github.com/taofu-labs/tpn-subnet | tensorplex `subnet.json` |
| 66 | AlphaCore | AlphaCore assists individuals and teams as they provision, monitor, and operate infrastructure across AWS, Azure, and… | https://github.com/AlphaCoreBittensor/alphacore | tensorplex `subnet.json` |
| 67 | Subnet 67 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 68 | NOVA | NOVA is a decentralized, AI-powered drug discovery platform that crowdsources screening of billions of synthesizable … | https://github.com/metanova-labs/nova | tensorplex `subnet.json` |
| 69 | Subnet 69 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 70 | Vericore | Vericore is a Bittensor subnet seeking to improve large-scale semantic fact-checking and verification. The subnet pro… | https://github.com/dfusionai/Vericore | tensorplex `subnet.json` |
| 71 | Leadpoet | Leadpoet is Subnet 71, the decentralized AI sales agent subnet built on Bittensor. Leadpoet's vision is streamlining … | https://github.com/Leadpoet/Leadpoet | tensorplex `subnet.json` |
| 72 | StreetVision | This network is a decentralized subnet designed to inference images to extract information such as construction sites… | https://github.com/natixnetwork/streetvision-subnet/ | tensorplex `subnet.json` |
| 73 | MetaHash | Metahash (Subnet 73) is a decentralized over-the-counter (OTC) layer that allows dTAO holders swap $ALPHA directly fo… | https://github.com/fx-integral/metahash | tensorplex `subnet.json` |
| 74 | Gittensor | Gittensor aims to accelerate the development of open source software (OSS) and enable OSS developers to be rewarded f… | https://github.com/entrius/gittensor | tensorplex `subnet.json` |
| 75 | Hippius | Hippius is a decentralized cloud storage platform powered by a custom Substrate blockchain, IPFS, and S3-compatible s… | https://github.com/thenervelab/thebrain | tensorplex `subnet.json` |
| 76 | Byzantium | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 77 | Liquidity | A complete on-chain liquidity mining system for the Bittensor ecosystem. | https://github.com/creativebuilds/sn77 | tensorplex `subnet.json` |
| 78 | Loosh | Loosh leverages Bittensor's scalable infrastructure to form Machine Consciousness. Starting Q4 2025 subnet workloads … | https://github.com/Loosh-ai | tensorplex `subnet.json` |
| 79 | MVTRX | Decentralized Simulation of Automated Trading in Intelligent Markets: Risk-Averse Agent Optimization | https://github.com/taos-im/sn-79 | tensorplex `subnet.json` |
| 80 | Dogelayer | Dogelayer aims to return mining rewards to those who create real value | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 81 | grail | grail focuses on post-training language models with verifiable inference capabilities. It leverages the GRAIL protoco… | https://github.com/tplr-ai/grail | tensorplex `subnet.json` |
| 82 | Hermes | SubQuery Hermes (SN82) is a decentralized infrastructure that bridges AI agents and on-chain data by enabling natural… | https://github.com/SN-Hermes/hermes-subnet | tensorplex `subnet.json` |
| 83 | CliqueAI | AI-Powered Maximum Clique Solver Network | https://github.com/toptensor/CliqueAI | tensorplex `subnet.json` |
| 84 | ChipForge (Tatsu) | ChipForge (SN84) introduces the first digital design subnet for decentralized hardware innovation. This subnet enable… | https://github.com/TatsuProject/ChipForge_SN84 | tensorplex `subnet.json` |
| 85 | vidaio | Revolutionizing Video Upscaling with AI-Driven Decentralisation | https://github.com/vidaio-subnet/vidaio-subnet | tensorplex `subnet.json` |
| 86 | Subnet 86 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 87 | Luminar Network | Checkerchain is a next-generation, AI-powered decentralized crypto review platform that leverages a trustless review … | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 88 | Investing | Envisioned as the world's first DeFAI powered AUM, leveraging a decentralized network of both human and artificial in… | https://github.com/mobiusfund/investing | tensorplex `subnet.json` |
| 89 | InfiniteHash | — | https://github.com/backend-developers-ltd/InfiniteHash | tensorplex `subnet.json` |
| 90 | Subnet 90 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 91 | Bitstarter #1 | A new subnet launch on Bitstarter - coming soon! | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 92 | TensorClaw | TensorClaw is a decentralized LLM inference subnet that aggregates high-quality LLM API nodes globally and exposes th… | https://github.com/tensorclaw/tensorclaw | tensorplex `subnet.json` |
| 93 | Bitcast | Bitcast is a decentralized platform that incentivizes content creators to connect brands with audiences. Creators pub… | https://github.com/bitcast-network/bitcast | tensorplex `subnet.json` |
| 94 | BITSOTA | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 95 | Actual Computer | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 96 | FLock OFF | FLock OFF is a Bittensor subnet designed to incentivize the creation of high-quality datasets for machine learning. M… | https://github.com/FLock-io/FLock-subnet | tensorplex `subnet.json` |
| 97 | Flamewire | FlameWire powers Ethereum, Bittensor, SUI, and more through a decentralized RPC/API infrastructure with global covera… | https://github.com/unitone-labs/FlameWire | tensorplex `subnet.json` |
| 98 | ForeverMoney 九八 | The REDACTED for @CreatorBid and beyond. | https://github.com/orgs/SN98-ForeverMoney/repositories | tensorplex `subnet.json` |
| 99 | Problems | Focused on faster, higher-quality video generation, driving innovation, empowering creators, and enabling commercial … | https://github.com/subnet99/neza | tensorplex `subnet.json` |
| 100 | Platform Network | Platform is a Bittensor subnet built to advance collaborative AI research through multiple simultaneous challenges po… | https://github.com/CortexLM/platform | tensorplex `subnet.json` |
| 101 | Subnet 101 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 102 | Subnet 102 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 103 | Djinn | Avocado is an AI-powered mental health companion app developed by HappyAI, designed to provide accessible, empathetic… | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 104 | Subnet 104 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 105 | Subnet 105 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 106 | VoidAI Liquidity Provisioning | Incentivized liquidity provisioning on Solana | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 107 | KDN-1 | Tiger Royalties and Investments PLC is an investment company focused on driving growth in transformative technologies… | https://github.com/tigerinvests-com/sn107-alpha | tensorplex `subnet.json` |
| 108 | TalkHead | TalkHead is a Bittensor subnet that incentivizes miners to generate high-quality, lip-synced talking-head video clips… | https://github.com/talkheadai/talkhead-subnet | tensorplex `subnet.json` |
| 109 | Subnet 109 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 110 | Rich Kids of TAO | Rich Kids of TAO is a Bittensor subnet that distributes rewards to miners based on their emissions across subnets cho… | https://github.com/Rich-Kids-of-TAO/rkt-subnet | tensorplex `subnet.json` |
| 111 | oneoneone | A decentralized AI ecosystem built on the Bittensor network that specializes in collecting, validating, and serving h… | https://github.com/oneoneone-io/subnet-111 | tensorplex `subnet.json` |
| 112 | minotaur | minotaur is a Bittensor subnet focused on swap‑intent processing and execution optimization. It leverages a subnet‑na… | https://github.com/subnet112/minotaur_subnet | tensorplex `subnet.json` |
| 113 | TensorUSD | A reserve-backed stablecoin designed to support 1:1 redeemability for the US Dollar within the Bittensor ecosystem, p… | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 114 | SOMA | AI solutions delivered through MCP infrastructure | https://github.com/Level114/level114-subnet | tensorplex `subnet.json` |
| 115 | Subnet 115 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 116 | TaoLend | TaoLend is a decentralized lending protocol within the Bittensor ($TAO) ecosystem. It enables users to lend TAO with … | https://github.com/xpenlab/taolend | tensorplex `subnet.json` |
| 117 | BrainPlay | Brainplay is a subnet of Bittensor designed to benchmark AI models through competitive gameplay. Instead of relying s… | https://github.com/shiftlayer-llc/brainplay-subnet | tensorplex `subnet.json` |
| 118 | HODL - The ETF Subnet | Incentivizing long-term conviction | https://github.com/mobiusfund/etf | tensorplex `subnet.json` |
| 119 | Subnet 119 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 120 | affine | affinity with the machine | https://github.com/AffineFoundation/affine | tensorplex `subnet.json` |
| 121 | sundae_bar | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 122 | Bitrecs | Bitrecs is a novel recommendation engine built on the Bittensor network. This implementation provides a framework for… | https://github.com/bitrecs/bitrecs-subnet | tensorplex `subnet.json` |
| 123 | MANTIS | The Ultimate Signal Machine | https://github.com/Barbariandev/MANTIS | tensorplex `subnet.json` |
| 124 | Swarm | Developing OS autopilot for drones | https://github.com/swarm-subnet/swarm | tensorplex `subnet.json` |
| 125 | 8 Ball | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 126 | Subnet 126 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 127 | Subnet 127 | — | docs-only / unverified in tensorplex | tensorplex `subnet.json` |
| 128 | ByteLeap | A Blockchain-Enhanced, Fully Decentralized Cloud Platform | https://github.com/byteleapai/byteleap-Miner | tensorplex `subnet.json` |

---

## 3. Per-subnet briefs (scannable)

Templates are **starting hypotheses**—validate scoring in each subnet’s README and on-chain before acting.
#### netuid 1 — Apex
- **Strategic buckets:** inference, finance | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** This Subnet defines an incentive mechanism to create a distributed conversational AI.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 2 — DSperse
- **Strategic buckets:** inference, infra_compute | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Subnet 2 represents a significant stride in enhancing the Bittensor network, aiming to create the world's largest peer-to-peer Verified Intelligence network, by building a Proof-of-Inference system fo…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 3 — Templar
- **Strategic buckets:** training, general_ai | **Tags:** maturity=experimental; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Incentivized Wide-Internet Training.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 4 — Targon
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** TARGON (Bittensor Subnet 4) is a redundant deterministic verification mechanism that can be used to interpret and analyze ground truth sources and a query.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 5 — Hone
- **Strategic buckets:** training, general_ai | **Tags:** maturity=experimental; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Hierarchical AI Pretraining
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 6 — Numinous
- **Strategic buckets:** inference, prediction_gaming, agents_security | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Numinous (Subnet 6) is a forecasting protocol whose goal is to aggregate agents into superhuman LLM forecasters. The key principle is that agents evolve and are scored in self-play forecasting environ…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 7 — Subnet 7
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 8 — Vanta Network
- **Strategic buckets:** finance, infra_compute | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Vanta Network incentivizes the contribution of profitable trading strategies across various financial markets. Contributors who provide the best trading signals receive the highest rewards, attracting…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 9 — IOTA
- **Strategic buckets:** inference, training, infra_compute | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Incentivized Orchestrated Training Architecture (IOTA) is a framework for pretraining large language models across a network of heterogeneous, unreliable, permissionless and token incentivized machine…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 10 — Swap
- **Strategic buckets:** finance, general_ai | **Tags:** maturity=established; capital=moderate_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Swap (SN10 on Bittensor) incentivizes miners to provide liquidity to the TAO<>USDC pool on TaoFi. Miners are scored based on how much fees their positions received in the past 24 hours.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 11 — TrajectoryRL
- **Strategic buckets:** agents_security, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Agentic RL as a Service, Optimize agent trajectories to make agents cheaper, safer, and more reliable.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 12 — Compute Horde
- **Strategic buckets:** infra_compute, general_ai | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Compute Horde is a specialized subnet (subnet 12) within the Bittensor network, designed to provide scalable, decentralized, and trusted GPU computing power for validators across other Bittensor subne…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 13 — Data Universe
- **Strategic buckets:** data_labeling, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Macrocosmos Data Universe is a large-scale, open-access platform that scrapes and aggregates real-time and historical social media data from platforms like X (formerly Twitter), Reddit, and YouTube. D…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 14 — TAO Hash
- **Strategic buckets:** coordination_gtm, general_ai | **Tags:** maturity=established; capital=moderate_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** The first and leading subnet for decentralizing PoW (proof-of-work) mining hashrate, rental and exchange. Validators receive hashrate in exchange for weights, and miners speculate on hashrate, hashpri…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 15 — Subnet 15
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 16 — BitAds
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 17 — 404—GEN
- **Strategic buckets:** inference, data_labeling, finance | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Three Gen incentivizes the development of AI models for generating 3D digital assets and the creation of synthetic 3D model datasets.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 18 — Zeus
- **Strategic buckets:** inference, data_labeling, prediction_gaming | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** The Zeus Subnet leverages advanced AI models within the Bittensor network to forecast environmental data. This platform is engineered on a decentralized, incentive-driven framework to enhance trustwor…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 19 — blockmachine
- **Strategic buckets:** infra_compute, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Blockmachine is a Bittensor subnet under active development, aiming to provide production-grade infrastructure with a focus on measurable work and real demand. Designed to function like a real busines…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 20 — GroundLayer
- **Strategic buckets:** coordination_gtm, general_ai | **Tags:** maturity=experimental; capital=variable; measurement=partial
- **Validator scoring (from public summary/repo; verify):** Structured OTC deals for subnet tokens.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 21 — OMEGA inc: The Awakening
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Proto-limb for emerging superintelligence.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 22 — Desearch
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Welcome to Desearch, the AI-powered search engine built on Bittensor. Designed for the Bittensor community and general internet users, Desearch delivers an unbiased and verifiable search experience. T…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 23 — Trishool
- **Strategic buckets:** inference, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** A Bittensor subnet for evaluating and detecting behavioral traits in Large Language Models (LLMs). This system creates a competitive environment where miners submit seed instructions (prompts) that ar…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 24 — Quasar
- **Strategic buckets:** inference, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Quasar is a Bittensor subnet (Subnet 24) designed to overcome the long-context limitation in AI models by enabling efficient reasoning across millions of tokens in a single context window. Leveraging …
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 25 — Mainframe
- **Strategic buckets:** science, infra_compute | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Powering decentralized science on Bittensor
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 26 — kinitro
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Advancing Embodied Intelligence With Directed Incentives
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 27 — Nodexo
- **Strategic buckets:** infra_compute, coordination_gtm | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Nodexo Compute (Subnet 27) is a decentralized platform that enables a trustless GPU compute marketplace, allowing individuals (miners) to contribute their GPU resources and earn rewards based on perfo…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 28 — Subnet 28
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 29 — Coldint
- **Strategic buckets:** agents_security, general_ai | **Tags:** maturity=established; capital=moderate_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** AI Agent Safety&Security Specialist Subnet
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 30 — Pending
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 31 — Subnet 31
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 32 — It's AI
- **Strategic buckets:** inference, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** It's AI incentivizes the development of systems that can identify LLM-generated content.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 33 — ReadyAI
- **Strategic buckets:** training, data_labeling | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** ReadyAI is focused on data structuring, incentivizing the transformation of unstructured data from sources like videos, podcasts, text, and images into structured formats suitable for training AI mode…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 34 — BitMind
- **Strategic buckets:** inference, prediction_gaming | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** BitMind is focused on detecting AI-generated media. Contributors are incentivized to create advanced models that can reliably differentiate between authentic and fabricated content.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 35 — Cartha (0xMarkets)
- **Strategic buckets:** finance, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** 0xmarkets is a decentralized exchange (DEX) platform designed to provide global, permissionless access to trading a wide range of financial assets, including cryptocurrencies, currencies, and commodit…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 36 — Web Agents
- **Strategic buckets:** prediction_gaming, agents_security | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Web Agents Subnet leverages our Infinite Web Arena (IWA) benchmark to incentivize Bittensor miners to develop SOTA web agents.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 37 — Aurelius
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Aurelius transforms alignment into an adversarial, incentive-driven process. Rather than trusting centralized judgment, it rewards independent discovery and reproducible scoring. The result is a conti…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 38 — colosseum
- **Strategic buckets:** prediction_gaming, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Tao Colosseum is a decentralized peer-to-peer betting protocol built on the Bittensor EVM, featuring an 'underdog' game where participants bet on either the red or blue team, and the side with less to…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 39 — basilica
- **Strategic buckets:** infra_compute, coordination_gtm | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Basilica is a decentralized GPU compute marketplace built on the Bittensor network. It creates a trustless environment where GPU providers (miners) can offer compute resources, and validators ensure q…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 40 — Chunking
- **Strategic buckets:** inference, general_ai | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Chunking incentivizes miners to break large documents into semantically coherent, optimally-sized text chunks for use in LLM pipelines, improving RAG query relevance and reducing inference cost.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 41 — Almanac
- **Strategic buckets:** finance, prediction_gaming | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Almanac, powered by the Sportstensor subnet on Bittensor, is an incentivized information layer for prediction markets, focusing on sports outcomes. It enables global AI talent and independent traders …
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 42 — Gopher
- **Strategic buckets:** inference, data_labeling, agents_security | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** A Layer-1 for the AI data economy. Access AI-ready data on demand. The fastest & simplest way to scrape and stream data straight into models, apps & agents.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 43 — Graphite
- **Strategic buckets:** infra_compute, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Graphite focuses on graph problems, which involve optimizing algorithms to solve computational challenges, such as finding the shortest path, optimizing network flow, or determining optimal arrangemen…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 44 — Score Vision
- **Strategic buckets:** infra_compute, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Score Vision is a decentralised computer vision framework built on Bittensor that drastically reduces the cost and time required for complex video analysis.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 45 — Talisman AI
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 46 — RESI
- **Strategic buckets:** data_labeling, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Building the world's largest open real estate database through decentralized intelligence
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 47 — EvolAI
- **Strategic buckets:** infra_compute, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Reboot Subnet – Robotics AI Network is a specialized Bittensor subnet for decentralized, AI-powered robotics services. It enables developers to build, deploy, and validate intelligent robotic systems …
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 48 — Quantum Compute
- **Strategic buckets:** infra_compute, coordination_gtm | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Quantum Compute (SN48) is a Bittensor subnet focused on democratizing access to quantum computing, creating an open marketplace for executing real quantum circuits on physical Quantum Processing Units…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 49 — Nepher
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 50 — Synth
- **Strategic buckets:** inference, data_labeling, finance | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Synth creates the world's most powerful Synthetic price data for DeFi, enabling a paradigm shift in how agents model and optimise for the future.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 51 — lium.io
- **Strategic buckets:** infra_compute, coordination_gtm | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** This project enables a decentralized, peer-to-peer GPU rental marketplace, connecting miners who contribute GPU resources with users who need computational power. Our frontend interface is available a…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 52 — Tensorplex Dojo
- **Strategic buckets:** data_labeling, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Tensorplex Dojo Subnet is an open platform designed to crowdsource high-quality human-generated datasets. Powered by Bittensor, the Dojo Subnet addresses these challenges by allowing anyone to earn TA…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 53 — Efficient Frontier
- **Strategic buckets:** finance, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Efficient Frontier is a project initiated by SignalPlus and Bittensor, designed to identify the optimal risk-weighted trading strategies through the integration of decentralized machine learning netwo…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 54 — MIID
- **Strategic buckets:** data_labeling, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** MIID (Multimodal Inorganic Identity Dataset) is a next-generation identity testing and identity data generation subnet designed to enhance fraud detection, KYC systems, and name-matching algorithms.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 55 — NIOME
- **Strategic buckets:** finance, science | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** NIOME is a decentralized AI subnet that enables privacy-safe genomic intelligence by replacing real human genomes with high-fidelity synthetic genomic profiles.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 56 — Gradients
- **Strategic buckets:** inference, training | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** On Gradients, Train SOTA Artificial Intelligence Models in a few clicks. The world's best AutoML platform.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 57 — Sparket.AI
- **Strategic buckets:** prediction_gaming, infra_compute | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Sparket.ai is a decentralized prediction infrastructure focused on sports and live events, operating as the first Bittensor subnet built on a patented architecture for decentralized betting markets. T…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 58 — Handshake
- **Strategic buckets:** agents_security, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Trustless micropayments for autonomous AI agent
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 59 — Babelbit
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Developing low-latency speech-to-speech translation on Bittensor
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 60 — Bitsec
- **Strategic buckets:** agents_security, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Bitsec is an Ecosystem for AI-powered code vulnerability detection. Initially it will help other Bittensor Subnet owners find and fix flaws in their incentive mechanisms, and find exploits in smart co…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 61 — Redteam
- **Strategic buckets:** agents_security, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** At RedTeam, we're creating a hub for ethical hacking and amplifying the collective intelligence of a unique community of engineers. For the first time, sophisticated attackers can be rewarded for thei…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 62 — Ridges AI
- **Strategic buckets:** agents_security, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Hire specialized software agents to do tasks in your codebase. AI agents that work out of the box at solving tasks like feature generation, fixing CI regressions, writing unit tests, and more.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 63 — Quantum Innovate
- **Strategic buckets:** finance, science | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Quantum Innovate (SN63) is a Bittensor subnet dedicated to fostering innovation in quantum computing algorithm execution. Miners are challenged with synthetic quantum circuits, such as peaked circuits…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 64 — Chutes
- **Strategic buckets:** inference, infra_compute | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Chutes provides true serverless, permissionless, decentralized, affordable compute to the world. Run any available model at scale, or deploy your own in seconds.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 65 — TAO Private Network
- **Strategic buckets:** infra_compute, general_ai | **Tags:** maturity=established; capital=moderate_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** TPN is a decentralized subnet designed to empower secure, private, and geographically diverse internet access through a global network of VPN providers. By coordinating miners and validators, TPN ensu…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 66 — AlphaCore
- **Strategic buckets:** agents_security, infra_compute | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** AlphaCore assists individuals and teams as they provision, monitor, and operate infrastructure across AWS, Azure, and Google Cloud. AlphaCore Agent handles infrastructure workflows so you can focus on…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 67 — Subnet 67
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 68 — NOVA
- **Strategic buckets:** finance, science | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** NOVA is a decentralized, AI-powered drug discovery platform that crowdsources screening of billions of synthesizable molecules to identify promising therapeutic compounds, rewarding miners with TAO em…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 69 — Subnet 69
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 70 — Vericore
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Vericore is a Bittensor subnet seeking to improve large-scale semantic fact-checking and verification. The subnet processes statements and returns evidence-based validation through relevant quotes and…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 71 — Leadpoet
- **Strategic buckets:** agents_security, coordination_gtm | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Leadpoet is Subnet 71, the decentralized AI sales agent subnet built on Bittensor. Leadpoet's vision is streamlining the top of sales funnel, starting with high-quality lead generation today and evolv…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 72 — StreetVision
- **Strategic buckets:** inference, infra_compute | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** This network is a decentralized subnet designed to inference images to extract information such as construction sites. Built on Bittensor, this subnet incentivizes miners to develop and deploy models …
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 73 — MetaHash
- **Strategic buckets:** finance, coordination_gtm | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Metahash (Subnet 73) is a decentralized over-the-counter (OTC) layer that allows dTAO holders swap $ALPHA directly for $META, eliminating slippage and price impact on their native subnets.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 74 — Gittensor
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Gittensor aims to accelerate the development of open source software (OSS) and enable OSS developers to be rewarded for meaningful work.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 75 — Hippius
- **Strategic buckets:** infra_compute, general_ai | **Tags:** maturity=established; capital=moderate_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Hippius is a decentralized cloud storage platform powered by a custom Substrate blockchain, IPFS, and S3-compatible storage.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 76 — Byzantium
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 77 — Liquidity
- **Strategic buckets:** finance, general_ai | **Tags:** maturity=established; capital=moderate_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** A complete on-chain liquidity mining system for the Bittensor ecosystem.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 78 — Loosh
- **Strategic buckets:** inference, prediction_gaming, infra_compute | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Loosh leverages Bittensor's scalable infrastructure to form Machine Consciousness. Starting Q4 2025 subnet workloads will be processing inference of live prompts from the beta testing of our cognitive…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 79 — MVTRX
- **Strategic buckets:** finance, agents_security | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Decentralized Simulation of Automated Trading in Intelligent Markets: Risk-Averse Agent Optimization
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 80 — Dogelayer
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=experimental; capital=variable; measurement=partial
- **Validator scoring (from public summary/repo; verify):** Dogelayer aims to return mining rewards to those who create real value
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 81 — grail
- **Strategic buckets:** inference, training | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** grail focuses on post-training language models with verifiable inference capabilities. It leverages the GRAIL protocol (Guaranteed Rollout Authenticity via Inference Ledger) to ensure cryptographicall…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 82 — Hermes
- **Strategic buckets:** data_labeling, agents_security, infra_compute | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** SubQuery Hermes (SN82) is a decentralized infrastructure that bridges AI agents and on-chain data by enabling natural language queries over blockchain datasets. Built as a specialized Bittensor subnet…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 83 — CliqueAI
- **Strategic buckets:** infra_compute, general_ai | **Tags:** maturity=experimental; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** AI-Powered Maximum Clique Solver Network
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 84 — ChipForge (Tatsu)
- **Strategic buckets:** science, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** ChipForge (SN84) introduces the first digital design subnet for decentralized hardware innovation. This subnet enables miners to compete in designing real silicon. Processor development is organized i…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 85 — vidaio
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Revolutionizing Video Upscaling with AI-Driven Decentralisation
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 86 — Subnet 86
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 87 — Luminar Network
- **Strategic buckets:** infra_compute, coordination_gtm | **Tags:** maturity=experimental; capital=variable; measurement=partial
- **Validator scoring (from public summary/repo; verify):** Checkerchain is a next-generation, AI-powered decentralized crypto review platform that leverages a trustless review consensus mechanism (TRCM) to ensure honest and reliable product evaluations. The p…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 88 — Investing
- **Strategic buckets:** finance, infra_compute | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Envisioned as the world's first DeFAI powered AUM, leveraging a decentralized network of both human and artificial intelligence, Investing is the Bittensor subnet with the mission to provide investmen…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 89 — InfiniteHash
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 90 — Subnet 90
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 91 — Bitstarter #1
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=experimental; capital=variable; measurement=partial
- **Validator scoring (from public summary/repo; verify):** A new subnet launch on Bitstarter - coming soon!
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 92 — TensorClaw
- **Strategic buckets:** inference, general_ai | **Tags:** maturity=established; capital=high_hw_or_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** TensorClaw is a decentralized LLM inference subnet that aggregates high-quality LLM API nodes globally and exposes them through a unified, load-balanced, OpenAI-compatible API with anti-cheat verifica…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 93 — Bitcast
- **Strategic buckets:** finance, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Bitcast is a decentralized platform that incentivizes content creators to connect brands with audiences. Creators publish YouTube videos to satisfy defined briefs and earn rewards based on engagement …
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 94 — BITSOTA
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 95 — Actual Computer
- **Strategic buckets:** infra_compute, general_ai | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 96 — FLock OFF
- **Strategic buckets:** data_labeling, general_ai | **Tags:** maturity=established; capital=moderate_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** FLock OFF is a Bittensor subnet designed to incentivize the creation of high-quality datasets for machine learning. Miners generate and upload datasets to Hugging Face, while validators assess their q…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 97 — Flamewire
- **Strategic buckets:** inference, infra_compute | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** FlameWire powers Ethereum, Bittensor, SUI, and more through a decentralized RPC/API infrastructure with global coverage, preserving crypto's core values decentralization, availability, and censorship …
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 98 — ForeverMoney 九八
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=experimental; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** The REDACTED for @CreatorBid and beyond.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 99 — Problems
- **Strategic buckets:** science, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Focused on faster, higher-quality video generation, driving innovation, empowering creators, and enabling commercial impact.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 100 — Platform Network
- **Strategic buckets:** infra_compute, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Platform is a Bittensor subnet built to advance collaborative AI research through multiple simultaneous challenges powered by sub-subnet technology. It enables miners to compete and cooperate across d…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 101 — Subnet 101
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 102 — Subnet 102
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 103 — Djinn
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=experimental; capital=variable; measurement=partial
- **Validator scoring (from public summary/repo; verify):** Avocado is an AI-powered mental health companion app developed by HappyAI, designed to provide accessible, empathetic, and evidence-based support 24/7. Leveraging advanced natural language understandi…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 104 — Subnet 104
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 105 — Subnet 105
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 106 — VoidAI Liquidity Provisioning
- **Strategic buckets:** finance, general_ai | **Tags:** maturity=experimental; capital=moderate_stake; measurement=partial
- **Validator scoring (from public summary/repo; verify):** Incentivized liquidity provisioning on Solana
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 107 — KDN-1
- **Strategic buckets:** finance, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Tiger Royalties and Investments PLC is an investment company focused on driving growth in transformative technologies, particularly within the utility meme coin and natural resources sectors. The comp…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 108 — TalkHead
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=established; capital=moderate_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** TalkHead is a Bittensor subnet that incentivizes miners to generate high-quality, lip-synced talking-head video clips from text plus a reference image (and optional voice profile). Validators evaluate…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 109 — Subnet 109
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 110 — Rich Kids of TAO
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Rich Kids of TAO is a Bittensor subnet that distributes rewards to miners based on their emissions across subnets chosen by community vote. Unlike previous "Miner Appreciation" subnets, this system al…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 111 — oneoneone
- **Strategic buckets:** infra_compute, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** A decentralized AI ecosystem built on the Bittensor network that specializes in collecting, validating, and serving high-quality user-generated content from platforms across the web.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 112 — minotaur
- **Strategic buckets:** finance, prediction_gaming | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** minotaur is a Bittensor subnet focused on swap‑intent processing and execution optimization. It leverages a subnet‑native incentive mechanism to deliver better, cheaper, and faster trades for users.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 113 — TensorUSD
- **Strategic buckets:** finance, general_ai | **Tags:** maturity=experimental; capital=variable; measurement=partial
- **Validator scoring (from public summary/repo; verify):** A reserve-backed stablecoin designed to support 1:1 redeemability for the US Dollar within the Bittensor ecosystem, powered by Bittensor SN113.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 114 — SOMA
- **Strategic buckets:** infra_compute, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** AI solutions delivered through MCP infrastructure
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 115 — Subnet 115
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 116 — TaoLend
- **Strategic buckets:** finance, general_ai | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** TaoLend is a decentralized lending protocol within the Bittensor ($TAO) ecosystem. It enables users to lend TAO with confidence while borrowers can secure loans using subnet ALPHA as collateral. By un…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 117 — BrainPlay
- **Strategic buckets:** inference, prediction_gaming | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Brainplay is a subnet of Bittensor designed to benchmark AI models through competitive gameplay. Instead of relying solely on abstract mathematical scores, this approach allows people to visually unde…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 118 — HODL - The ETF Subnet
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=experimental; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Incentivizing long-term conviction
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 119 — Subnet 119
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 120 — affine
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=experimental; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** affinity with the machine
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 121 — sundae_bar
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 122 — Bitrecs
- **Strategic buckets:** inference, infra_compute | **Tags:** maturity=established; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Bitrecs is a novel recommendation engine built on the Bittensor network. This implementation provides a framework for serving realtime e-commerce recommendations using LLMs. Miners are encouraged to e…
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Taoflow-sensitive: subnet popularity affects TAO injection; verify flow + emissions before sizing opex.

#### netuid 123 — MANTIS
- **Strategic buckets:** prediction_gaming, general_ai | **Tags:** maturity=experimental; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** The Ultimate Signal Machine
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 124 — Swarm
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=experimental; capital=variable; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** Developing OS autopilot for drones
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 125 — 8 Ball
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 126 — Subnet 126
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 127 — Subnet 127
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=unverified; capital=variable; measurement=opaque
- **Validator scoring (from public summary/repo; verify):** No tensorplex summary—read subnet GitHub or Discord for objective.
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

#### netuid 128 — ByteLeap
- **Strategic buckets:** general_ai, coordination_gtm | **Tags:** maturity=established; capital=moderate_stake; measurement=documented_repo
- **Validator scoring (from public summary/repo; verify):** A Blockchain-Enhanced, Fully Decentralized Cloud Platform
- **Anti-cheat / ops:** Registration burn and tempo per Subtensor; latency/uptime subnet-specific—confirm in repo. **Speculation:** competitive subnets often see rapid rule updates.
- **Skills & tools:** Python; `btcli`; subnet repo stack; GPU/HTTP as per README.
- **Ideal profile:** Varies by subnet—see scoring line; generally ML+DevOps for inference/training, domain SME for science/finance subnets.
- **Fit (OpenGrimoire posture):** Off-chain product work aligns with **Lane 4** (APIs, eval harnesses around outputs). On-chain **Lanes 2–3** only if you run subnet miner/validator code with ops budget. **Lane 1** = delegation only—no subnet code.
- **Taoflow / Yuma:** Yuma ranks relative miners; Taoflow still sets subnet-level TAO share—check staking flows.

---

## 4. Network placement matrix (roles → subnets → lanes)

| Role | Top subnet matches (examples) | Suggested lane | Rationale | Gap to close |
|------|------------------------------|----------------|-----------|--------------|
| ML engineer | Apex (1), Chutes (64), TensorClaw (92), Gradients (56), IOTA (9) | 2 mine / 3 validate if bonded | Rewarded on **measurable model/serve quality** per subnet rules | Dedicated subnet DevOps; cold start on registration economics |
| Infra / DevOps | Compute Horde (12), Nodexo (27), lium.io (51), Basilica (39), ByteLeap (128) | 2 mine | GPU/uptime and **SLA**-style delivery | Multi-region monitoring; bare-metal GPU contracts |
| GTM / partnerships | Tensorplex Dojo (52), Data Universe (13), Bitcast (93), Leadpoet (71) | 4 adjacent + 1 stake | **Lane 4** product around data, creators, or sales—**Taoflow** still affects subnet TAO | BD into subnet teams; compliance for data |
| Research | Mainframe (25), NOVA (68), Quasar (24), Zeus (18), MANTIS (123) | 2 mine / 4 publish | Science/finance **forecasting** subnets reward domain metrics | Domain co-authors; reproducible eval harness |
| Capital / treasury | Swap (10), Liquidity (77), MetaHash (73), TaoLend (116), HODL ETF (118) | 1 stake / 5 alpha | **High Taoflow and regulatory sensitivity**—not expanded as advice | Policy counsel; dashboard verification on-chain |

**Taoflow note:** For **finance** and **liquidity** subnets, **staking flow** and **subnet attention** can dominate **short-run** emission narratives—pair technical due diligence with **flow** charts from explorer data.

### 4.1 Lane 1 — root staking vs subnet alpha (informational; not advice)

Under **Dynamic TAO**, delegators choose among **root** and **per-subnet alpha** exposure in ways that affect **which incentive surfaces** you touch ([dTAO guide](https://docs.bittensor.com/dynamic-tao/dtao-guide)). This is **not** financial or tax guidance. Strategically: **Taoflow** means subnet-level **TAO injection** still depends on **net flows**—so “passive” staking is **not** free of **popularity** dynamics, even without running a miner.

---

## 5. Risks and verification checklist

### 5.1 Goodhart (metric vs utility)

Validators optimize **measurable** scores; product value may diverge ([BITTENSOR_EVALUATION.md](./BITTENSOR_EVALUATION.md) §6.1). Per subnet, ask: *what would a rational miner overfit?*

### 5.2 Policy and upgrade risk

Subnet owners can **change** objectives, hyperparameters, and registration economics. **Taoflow** and **emissions** parameters also change at protocol level—track [emissions](https://docs.bittensor.com/emissions) and subnet release notes.

### 5.3 Verify on-chain / explorer before committing

1. Subnet **active** and expected `netuid` on your target network (mainnet/finney).
2. **Registration cost** (burn) and **tempo**.
3. **Emission share** to subnet (Taoflow) and recent **flow**—not just leaderboard rank.
4. **Validator count** and weight variance (Yuma clipping context).
5. **Open-source** miner/validator matches what you intend to run (commit hash).

---

## 6. Official and canonical links (numbered)

1. [Emissions (Taoflow, tempo, splits)](https://docs.bittensor.com/emissions)
2. [Yuma Consensus](https://docs.learnbittensor.org/learn/yuma-consensus)
3. [Navigating Subtensor](https://docs.learnbittensor.org/navigating-subtensor)
4. [Bittensor.ai API status](https://bittensor.ai/docs)
5. [Dynamic TAO / dTAO guide](https://docs.bittensor.com/dynamic-tao/dtao-guide) (context for alpha and subnet tokens)
6. [Taostats subnets explorer](https://taostats.io/subnets) (third-party—**reconcile** with chain)
7. [tensorplex-labs/subnet-docs](https://github.com/tensorplex-labs/subnet-docs) (community metadata—**not** protocol authority)

---