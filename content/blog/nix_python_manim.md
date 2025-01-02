---
title: Nix, Python and Manim
tags:
    - nix
    - blog
    - technology
draft: false
---

In my futile attemps to setup a nix-based manim workflow, I have arrived at many problems.

First of all, python and nix tooling seems fairly weak, and I blame python more than nix for this. Take Rust into consideration. Its tooling is well-defined, and there is no need to have 154 competing tools to install packages and dependencies.

And that is one of the reasons the rust-nix ecosystem seems to work nicely.

After quite a bit of struggle, the solution was to do the following:

1. Define the [repository](https://github.com/AlejandroGomezFrieiro/nix_manim_template). The `flake.nix` file sets up all the dependencies to manage an impure nix shell through `devenv`.
2. Generate a `.venv` environment using `python -m venv .venv`. If I try to use `uv` to generate this, it fails catastrophically.
3. Source the environment, add the correct packages.

I also setup some Github Actions to automatically render the contents of the package into a high-quality MP4, which is somewhat greedy haha

```yaml
name: "Render manim"
on:
  pull_request:
  push:
jobs:
  render:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest]
    steps:
    - uses: actions/checkout@v4
    - uses: DeterminateSystems/nix-installer-action@main
    - uses: DeterminateSystems/magic-nix-cache-action@main
    - uses: nicknovitski/nix-develop@v1
      with:
        arguments: ".#render --no-pure-eval"
    - name: Render
      run: just render
    - uses: actions/upload-artifact@v4
      with:
        name: rendered_videos
        path: media
```
