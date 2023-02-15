#!/usr/bin/env node

import { cancel, intro, isCancel, outro, select } from "@clack/prompts";
import { execa } from "execa";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));
const showHelp = argv._.some((arg) => ["-h", "--help"].includes(arg));
const count = (argv.count || argv.c) ?? 5;

const helpMessage = `Usage: git-recent-branch [options]

Options:
-h, --help      Show this help message
-c, --count     Number of branches to show (default: 5)
`;

if (showHelp) {
    console.log(helpMessage);
    process.exit(0);
}

(async () => {
    intro(`Checkout one of your most recent branches ✅`);

    const { stdout: branches } = await execa("git", [
        "for-each-ref",
        `--count=${count}`,
        "--sort=-committerdate",
        "refs/heads",
        "--format='%(authordate:short) %(color:red)%(objectname:short) %(color:yellow)%(refname:short)%(color:reset) (%(color:green)%(committerdate:relative)%(color:reset))'",
    ]);

    let options = [];
    for (let branch of branches.split("\n")) {
        branch = branch.replace(/'/g, "");
        const time = new RegExp(/\(([^)]+)\)/).exec(branch)?.[1];
        const [date, hash, name] = branch.split(" ");

        options.push({
            value: name,
            label: `${name} - ${time}`,
            hint: `${hash}`,
        });
    }

    const branch = await select({
        message: "Select the branch you want to checkout",
        options,
    });

    if (isCancel(branch)) {
        cancel("No branch selected.");
        process.exit(0);
    }

    execa("git", ["checkout", branch]).stdout?.pipe(process.stdout);

    outro(`Branch ${branch} checked out!`);
})();
