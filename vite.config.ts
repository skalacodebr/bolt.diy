import { defineConfig, type ViteDevServer } from 'vite';
import * as dotenv from 'dotenv';
import UnoCSS from 'unocss/vite';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';
// Se precisar de algumas polyfills de Node que funcionem no browser, use:
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// *** NUNCA importe child_process em runtime ***
// Aqui, no tempo de BUILD, está tudo certo:
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

// Plugins Remix (exemplo):
import {
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
  vitePlugin as remixVitePlugin,
} from '@remix-run/dev';

// Carrega variáveis de ambiente
dotenv.config();

// --------------------------------------------------------
// FUNÇÕES AUXILIARES SÓ PARA TEMPO DE BUILD
// --------------------------------------------------------
function getGitInfo() {
  try {
    return {
      commitHash: execSync('git rev-parse --short HEAD').toString().trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
      commitTime: execSync('git log -1 --format=%cd').toString().trim(),
      author: execSync('git log -1 --format=%an').toString().trim(),
      email: execSync('git log -1 --format=%ae').toString().trim(),
      remoteUrl: execSync('git config --get remote.origin.url').toString().trim(),
      repoName: execSync('git config --get remote.origin.url')
        .toString()
        .trim()
        .replace(/^.*github.com[:/]/, '')
        .replace(/\.git$/, ''),
    };
  } catch {
    return {
      commitHash: 'no-git-info',
      branch: 'unknown',
      commitTime: 'unknown',
      author: 'unknown',
      email: 'unknown',
      remoteUrl: 'unknown',
      repoName: 'unknown',
    };
  }
}

function getPackageJson() {
  try {
    const pkgPath = join(process.cwd(), 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return {
      name: pkg.name,
      description: pkg.description,
      license: pkg.license,
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
      peerDependencies: pkg.peerDependencies || {},
      optionalDependencies: pkg.optionalDependencies || {},
    };
  } catch {
    return {
      name: 'bolt.diy',
      description: 'A DIY LLM interface',
      license: 'MIT',
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {},
    };
  }
}

// Pega informações do Git e do package.json em TEMPO DE BUILD
const gitInfo = getGitInfo();
const pkg = getPackageJson();

// Plugin interno que bloqueia Chrome 129 para dev, por exemplo
function chrome129IssuePlugin() {
  return {
    name: 'chrome129IssuePlugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const raw = req.headers['user-agent']?.match(/Chrom(e|ium)\/([0-9]+)\./);
        if (raw) {
          const version = parseInt(raw[2], 10);
          if (version === 129) {
            res.setHeader('content-type', 'text/html');
            res.end(
              '<body><h1>Use Chrome Canary (130+) para testar local.</h1><p>Chrome 129 tem bug com módulos ES e Vite, etc...</p></body>'
            );
            return;
          }
        }
        next();
      });
    },
  };
}

// --------------------------------------------------------
// CONFIG PRINCIPAL
// --------------------------------------------------------
export default defineConfig((config) => {
  return {
    // Define constantes globais substituídas em tempo de build.
    // No seu código do app, use: console.log(__COMMIT_HASH, __PKG_NAME, etc.)
    define: {
      __COMMIT_HASH: JSON.stringify(gitInfo.commitHash),
      __GIT_BRANCH: JSON.stringify(gitInfo.branch),
      __GIT_COMMIT_TIME: JSON.stringify(gitInfo.commitTime),
      __GIT_AUTHOR: JSON.stringify(gitInfo.author),
      __GIT_EMAIL: JSON.stringify(gitInfo.email),
      __GIT_REMOTE_URL: JSON.stringify(gitInfo.remoteUrl),
      __GIT_REPO_NAME: JSON.stringify(gitInfo.repoName),
      __APP_VERSION: JSON.stringify(process.env.npm_package_version),
      __PKG_NAME: JSON.stringify(pkg.name),
      __PKG_DESCRIPTION: JSON.stringify(pkg.description),
      __PKG_LICENSE: JSON.stringify(pkg.license),
      __PKG_DEPENDENCIES: JSON.stringify(pkg.dependencies),
      __PKG_DEV_DEPENDENCIES: JSON.stringify(pkg.devDependencies),
      __PKG_PEER_DEPENDENCIES: JSON.stringify(pkg.peerDependencies),
      __PKG_OPTIONAL_DEPENDENCIES: JSON.stringify(pkg.optionalDependencies),
    },

    build: {
      target: 'esnext',

      // 1) Isso ignora o aviso de que chunks estão acima de 500kB
      chunkSizeWarningLimit: 2000, // ou algum valor maior que 500

      // Caso queira controlar manualmente o splitting:
      // rollupOptions: {
      //   output: {
      //     manualChunks: {
      //       // Exemplo: separa 'xterm' em outro chunk, etc
      //       xterm: ['xterm'],
      //     },
      //   },
      // },
    },

    // Se estiver rodando no Cloudflare Workers, ou Pages Functions, normalmente o target é "webworker"
    // mas o Remix plugin já cuida disso. Se precisar, algo como:
    // ssr: { target: 'webworker' },

    plugins: [
      // Se precisar de polyfills, mas cuidado: child_process não funciona
      nodePolyfills({
        include: ['buffer', 'process', 'path'], 
        // Se adicionar 'crypto' tome cuidado para usar WebCrypto no Worker
      }),

      // Só habilite o dev proxy se não estiver em "test"
      config.mode !== 'test' && remixCloudflareDevProxy(),

      // Plugin do Remix (v3 flags)
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_lazyRouteDiscovery: true,
        },
      }),

      UnoCSS(),
      tsconfigPaths(),
      chrome129IssuePlugin(),

      // Só otimiza CSS Modules em produção
      config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ],

    // Você pode prefixar envs específicas
    envPrefix: [
      'VITE_',
      'OPENAI_LIKE_API_BASE_URL',
      'OLLAMA_API_BASE_URL',
      'LMSTUDIO_API_BASE_URL',
      'TOGETHER_API_BASE_URL',
    ],

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  };
});