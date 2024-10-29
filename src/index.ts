#!/usr/bin/env node

import { select } from "@inquirer/prompts";
import { execa } from "execa";
import minimist from "minimist";
import pc from "picocolors";

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

const currentBranch = async () => {
    try {
        const { stdout } = await execa("git", ["branch", "--show-current"]);
        return stdout;
    } catch (error: any) {
        return "";
    }
};

const main = async () => {
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
            console.log("This is not a git repository 🤷");
            process.exit(0);
        } else {
            console.log(error.stderr);
            process.exit(0);
        }
    }

    const current = await currentBranch();

    console.log(pc.bgCyan(pc.black(" Git recent branch ".toUpperCase())));
    console.log();

    let choices = [];
    for (let branch of branches.split("\n")) {
        branch = branch.replace(/'/g, "");
        const time = new RegExp(/\(([^)]+)\)/).exec(branch)?.[1];
        const [date, hash, name] = branch.split(" ");

        if (name === current) {
            continue;
        }

        choices.push({
            value: name,
            name: `${pc.green(name)} (${hash}) - ${time}`,
        });
    }

    const branch = await select({
        message: "Select the branch you want to checkout",
        choices,
    }).catch(() => {
        console.log(pc.red("\n❌ No branch selected"));
        process.exit(0);
    });

    console.log(`➡️  Checking out ${pc.green(branch)}!\n`);

    try {
        await execa("git", ["checkout", branch], { stdio: "inherit" });
    } catch (error: any) {
        console.log(`\n❌ Could not checkout branch: ${pc.green(branch)}`);
        process.exit(0);
    }
};

main().catch(console.error);
