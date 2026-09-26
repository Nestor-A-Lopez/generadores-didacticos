Wraps rendered KaTeX/MathJax output (or literal math glyphs) so equations never look pasted-in.

```jsx
<Formula display label="v es la velocidad; d, la distancia; t, el tiempo.">v = d ⁄ t</Formula>
```

Point the math engine at **STIX Two Math** or **New Computer Modern Math**, not the default Computer Modern. Every display formula carries a `label` naming its variables in words.
