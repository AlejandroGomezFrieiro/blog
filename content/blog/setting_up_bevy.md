---
title: Setting up Bevy
---

Game development is something I have always found fascinating. After all, it combines several completely distinct skills such as programming, art and music to create a (hopefully fun) interactive experience.

Since I like to challenge myself, I decided to setup a quick development environment using a new interesting game engine called [Bevy](https://bevyengine.org/).

The specifics about Bevy are out of scope for this post, but I want to share how I setup a quick development environment.

Of course, Nix-style.

## Setting up a development flake

As always, the first step is to setup a development flake. I decided to start from [this rust template](https://github.com/nulladmin1/nix-flake-templates/tree/main/rust-fenix-naersk).

So let's start

```bash
mkdir bevy_game
cd bevy_game
nix flake init --template "github:nulladmin1/nix-flake-templates#rust-fenix-naersk"
```

This should setup the following structure, as shown from the [README](https://github.com/nulladmin1/nix-flake-templates/blob/main/rust-fenix-naersk/README.md).

```
📦 bevy_game
├─ 🔒 Cargo.lock
├─ ⚙️ Cargo.toml
├─ 🔒 flake.lock
├─ ⚙️ flake.nix
├─ 📁 src
│  ├─ 🦀 main.rs
├─ 📃 README.md
```

So good so far!

Let's enter the development shell using `nix develop` and add bevy to our dependencies.

```bash
nix develop
cargo add bevy
```

This might take a while, but after it is done we should have an environment setup for this. Let's try compiling the current project and running it.


```bash
cargo run
```

Whoops something went wrong. If we look in the [Setup](https://bevyengine.org/learn/quick-start/getting-started/setup/) section of the Bevy website, you'll see that some build dependencies are needed.

I ended up adding the following in the default shell.

```nix
...
default = pkgsFor.${system}.mkShell rec {
    nativeBuildInputs = with (pkgsFor.${system}); [
    pkg-config
    ];
    buildInputs =with pkgsFor.${system};  [
    udev alsa-lib vulkan-loader
    xorg.libX11 xorg.libXcursor xorg.libXi xorg.libXrandr # To use the x11 feature
    libxkbcommon wayland # To use the wayland feature
    ];
    LD_LIBRARY_PATH = pkgsFor.${system}.lib.makeLibraryPath buildInputs;
...
```

Let's try to run and compile it.

```bash
cargo run
```

This should compile and output a `Hello, World!` to our terminal. Great!

However this is quite slow... Let's add dynamic linking to speed up compile times. We'll add `justfile` for ease of development.

```bash
touch justfile
```

We'll make a default command for running bevy with dynamic linking.

```just
run:
    cargo run --features bevy/dynamic_linking
```

Now we can just call `just run`, and it should compile and execute!

