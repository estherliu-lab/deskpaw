# Skill Repository README Guideline

This is the preferred GitHub repository introduction pattern for future skill repositories.

## Language Switch

Use simple text links near the top of the README:

```text
Product Name | 中文名

English | 中文
```

In GitHub README files, this should be implemented with anchor links:

```md
[English](#english) | [中文](#中文)
```

Do not mix Chinese and English in the same paragraph. Keep the English section and Chinese section separate.

## Content

- Provide at least English and Chinese.
- Do not create an extra showcase page unless the user explicitly asks for one.
- Put the QR code left-aligned when mobile install or mobile preview matters.
- Do not show the app icon as a decorative preview in the README unless the user explicitly asks for it.
- Keep the repository introduction clean and documentation-like.

## Recommended README Structure

```md
# Product Name | 中文名

[English](#english) | [中文](#中文)

<p>
  <img src="QR_CODE_URL" width="180" alt="QR code" />
</p>

<a id="english"></a>

## English

English introduction...

<a id="中文"></a>

## 中文

中文介绍...
```
