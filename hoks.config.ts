import { defineConfig } from "hoks";

export default defineConfig({
    installOnLockChange: {
        prompt: true,
        noText: false,
        installation: "show",
    },
});
