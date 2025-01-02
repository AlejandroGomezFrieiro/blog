---
title: Testing Quartz
draft: false
tags:
    - quartz
    - nix
---

I have been wanting to have a personal blog for a while now. It has been quite difficult to keep up with my writing, both technical and personal, and a personal blog sounded like the ideal way to go about it. In particular considering the current state of the Internet.

In this page I wanted to leave some thoughts on how I setup my Quartz repository.

# Nix flake

I have been infatuated with Nix for about half a year now. For those that might be unaware, Nix is a programming language and packaging tool that lets you setup reproducible and declarative environments. I don't really have ways to use it in my day-to-day job, but for personal projects the first thing I am always doing is setting up a nix flake.

Since I am still a youngling with respect to Nix, I tend to look around for how people solved the problem first. To build Quartz and its development environment, I needed a flake that would give me a devshell with

- NodeJS and the quartz dependencies setup.
- A personalized [[Neovim]] environment.

The flake I ended up writing is based on [this blogpost](https://johns.codes/blog/building-typescript-node-apps-with-nix). You can of course take a look at it in this blog's repository, but for those curious

```nix
{
  description = "Quartz personal flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    nixvim_config.url = "github:AlejandroGomezFrieiro/nixvim_config";
    gitignore = {
      url = "github:hercules-ci/gitignore.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
      self,
      nixpkgs, 
      nixvim_config,
      flake-utils,
      gitignore, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        nodejs = pkgs.nodejs_20;

        node2nixOutput = import ./nix { inherit pkgs nodejs system; };
        # NOTE: may want to try https://github.com/svanderburg/node2nix/issues/301 to limit rebuilds
        nodeDeps = node2nixOutput.nodeDependencies;
        app = pkgs.stdenv.mkDerivation {
          name = "example-ts-node";
          version = "0.1.0";
          src = gitignore.lib.gitignoreSource ./.;
          buildInputs = [ nodejs ];
          buildPhase = ''
            runHook preBuild

            # symlink the generated node deps to the current directory for building
            ln -sf ${nodeDeps}/lib/node_modules ./node_modules
            export PATH="${nodeDeps}/bin:$PATH"

            npm run build

            runHook postBuild
          '';
          installPhase = ''
            runHook preInstall

            # Note: you need some sort of `mkdir` on $out for any of the following commands to work
            mkdir -p $out/bin

            # copy only whats needed for running the built app
            cp package.json $out/package.json
            cp -r dist $out/dist
            ln -sf ${nodeDeps}/lib/node_modules $out/node_modules

            # copy entry point, in this case our index.ts has the node shebang
            # nix will patch the shebang to be the node version specified in buildInputs
            # you could also copy in a script that is basically `npm run start`
            cp dist/index.js $out/bin/example-ts-nix
            chmod a+x $out/bin/example-ts-nix

            runHook postInstall
          '';
        };

        neovimModule = {
          inherit pkgs;
          module = {
            imports = [
              nixvim_config.outputs.nixosModules.${system}.nvim
            ];
            plugins.lsp.servers.markdown_oxide.enable = true;
            plugins.lsp.servers.tsserver.enable = true;
            extraPlugins = with pkgs.vimPlugins; [
                markdown-nvim
                ];
            extraConfigLua = "require('markdown').setup()";
          };
        };
        neovim = nixvim_config.inputs.nixvim.legacyPackages.${system}.makeNixvimWithModule neovimModule;
      in with pkgs; {
        defaultPackage = app;
        devShell = mkShell { buildInputs = [ just neovim markdown-oxide nodejs node2nix ]; };
      });
}
```

# Neovim configuration

I have tested [Neovim oxide](https://github.com/Feel-ix-343/markdown-oxide) in the past together with [markdown.nvim](https://github.com/tadmccorkle/markdown.nvim) and I find the markdown-first knowledge management to be quite efficient, so I decided to set them up together in this project. Markdown oxide gives me an Obsidian-like way to interconnect my notes through a Language Server Protocol (LSP), while `markdown.nvim` just has nice functionality to work with markdown.

For example, to make the following word **bold**, all that is needed is to select it in visual mode and press `gsb`. This can also be done in Normal mode to make this word *italic* with `gswi`. Neovim is truly magic. There is also LSP-support for adding internal links through typing `[[`, like it's done here to link to the [[index]].

# Justfile

[Just](https://github.com/casey/just) is an alternative to makefile with very simple syntax. I am still trying to figure out how the more complicated features and recipes work, but I can quickly serve this Quartz blog by running

```bash
just serve
```

# Conclusion

Overall I am quite happy with the setup. I just need to clone the repo and run `nix develop` to start writing anywhere (I hope! Fingers crossed!).
