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

async function main() {
    let branches = "";
    try {
        const { stdout } = await execa("git", [
            "for-each-ref",
            `--count=${count}`,
            "--sort=-committerdate",
            "refs/heads",
            "--format='%(authordate:short) %(color:red)%(objectname:short) %(color:yellow)%(refname:short)%(color:reset) (%(color:green)%(committerdate:relative)%(color:reset))'",
        ]);
        branches = stdout;
    } catch (error: any) {
        if (error.stderr.includes("not a git repository")) {
            outro("This is not a git repository 🤷");
            process.exit(0);
        } else {
            console.log(error.stderr);
            process.exit(0);
        }
    }

    intro(`Checkout one of your most recent branches`);

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

    try {
        await execa("git", ["checkout", branch]);
    } catch (error: any) {
        outro(`Could not checkout branch: ${branch} ❌`);

        console.log(error.stderr);
        process.exit(0);
    }

    outro(`Branch ${branch} checked out! ✅`);
}

main().catch(console.error);
