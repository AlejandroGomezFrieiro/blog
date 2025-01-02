
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
