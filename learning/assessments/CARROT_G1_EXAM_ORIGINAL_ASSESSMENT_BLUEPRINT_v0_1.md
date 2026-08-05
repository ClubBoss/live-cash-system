# Carrot Grade 1 Exam — Original Assessment Blueprint v0.1

Status: `ASSESSMENT_ARCHITECTURE_READY / SOURCE_SPOTS_NOT_REUSED`

## Purpose

Use the competency structure of the supplied Grade 1 exam to improve the adaptive Live Cash System without copying its exact boards, hands, wording or visual design.

## Ten original assessment families

| Family ID | Competency | Required response | Primary modules |
|---|---|---|---|
| `G1-AF-01` | EV versus equity | estimate direction and explain conversion | `LCM-03`, `LCM-04` |
| `G1-AF-02` | value threshold | mandatory / optional / prohibited plus reason | `LCM-05`, `LCM-06` |
| `G1-AF-03` | bluff threshold | mandatory / optional / prohibited plus check EV | `LCM-06`, `LCM-09` |
| `G1-AF-04` | range shape | polar / merged / condensed plus equity/nut split | `LCM-04`, `LCM-09` |
| `G1-AF-05` | open-action protocol | rank call/raise/fold and explain realisation | `LCM-03`, `LCM-06` |
| `G1-AF-06` | global frequency and size | choose one simplification before hand selection | `LCM-04`, `LCM-05` |
| `G1-AF-07` | world favourability | favourable / neutral / unfavourable and bluff floor | `LCM-06` |
| `G1-AF-08` | strategy shape | semi-polar / polar plus size | `LCM-05`, `LCM-07` |
| `G1-AF-09` | river geography | weakest value, highest-SDV bluff, medium check | `LCM-09` |
| `G1-AF-10` | blocker ranking | remove non-candidates, then rank blockers | `LCM-09` |

## Adaptive response schema

Every assessment item should capture:

```yaml
action_or_label:
reason:
confidence:
range_level_explanation:
hand_level_exception:
```

Scoring separates:

- correct action;
- correct mechanism;
- correct boundary;
- confidence calibration.

## Misuse guards

Do not:

- ask for unsupported exact solver frequency;
- reward “top pair” or “blocker” without range context;
- treat a plus-EV action as automatically optimal;
- use end-of-action pot odds in an open-action node;
- infer sizing from visible draws alone;
- reuse the source's exact card combinations.

## Variant generation

Each family should vary at least two of:

- position pair;
- pot type;
- effective depth;
- number of players;
- board family;
- previous action filter;
- bet size;
- in-position versus out-of-position status.

## Release state

Ready now as an assessment blueprint.

Final answer keys for any newly generated item require:

- original spot construction;
- source-supported mechanism;
- clear boundary;
- no dependence on missing exact chart cells.

## Verdict

`CARROT_G1_EXAM_COMPETENCY_ARCHITECTURE_ABSORBED`

`PRODUCT_ASSESSMENTS_MUST_BE_ORIGINAL`
