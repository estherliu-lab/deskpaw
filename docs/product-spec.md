# DeskPaw Product Spec

## Positioning

DeskPaw 桌面爪爪 is a healing, practical pet companion tool. V1 turns one pet photo into a personalized local companion that can be installed as a mobile PWA. Future versions can extend it into a real desktop pet.

## V1 Scope

- Web PWA first.
- Mock/template-based pet generation.
- Local processing and storage by default.
- No paid AI API dependency.
- Chinese and English interface.
- 17 visual styles.
- 15 action states.
- Upload/editor, result page, pet home, install guide, and about page.

## User Flow

1. Open the home page.
2. Upload a pet photo or use the built-in demo image.
3. Enter a pet name and type.
4. Choose a visual style.
5. Choose one or more actions.
6. Generate a DeskPaw result.
7. Enter the pet home, interact, focus, or download a share card.

## AI Integration Point

`src/lib/generator.ts` contains:

```ts
async function generatePetCharacter(input, language) {
  // V1: mock/template-based generation.
  // Future: connect this function to an AI image generation or background-removal API.
}
```

Future services should clearly disclose cloud processing before uploading user photos.
