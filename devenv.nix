{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    pnpm.enable = true;
  };

  services.postgres = {
    enable = true;
    package = pkgs.postgresql_16;
    listen_addresses = "127.0.0.1";
    port = 5432;
    initialDatabases = [{ name = "wemaintain"; user = "wemaintain"; pass = "wemaintain"; }];
  };

  env.DATABASE_URL = "postgres://wemaintain:wemaintain@127.0.0.1:5432/wemaintain";

  enterShell = ''
    echo "WeMaintain fullstack case. In another terminal: devenv up (starts Postgres)."
    echo "Then: pnpm install && pnpm seed && pnpm dev"
  '';
}
