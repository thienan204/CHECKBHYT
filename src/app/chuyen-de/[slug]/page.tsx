import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, Tag } from 'antd';
import { InfoCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import SpecializedRuleRunner from '@/components/specialized/SpecializedRuleRunner';

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getRule(slug: string) {
    try {
        const rule = await prisma.specializedRule.findUnique({
            where: { slug },
        });
        return rule;
    } catch (error) {
        console.error("Failed to fetch rule:", error);
        return null;
    }
}

export default async function SpecializedRulePage({ params }: PageProps) {
    const resolvedParams = await params;
    const rule = await getRule(resolvedParams.slug);

    if (!rule) {
        notFound();
    }

    // Determine color based on type
    const getTagColor = (type: string) => {
        if (type === 'DUPLICATE_BED') return 'orange';
        if (type === 'MACHINE_CHECK') return 'blue';
        return 'default';
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-slate-800">{rule.name}</h1>
                    <Tag color={getTagColor(rule.ruleType)}>{rule.ruleType}</Tag>
                    {rule.isActive ? <Tag color="success">Active</Tag> : <Tag color="error">Inactive</Tag>}
                </div>
                <p className="text-slate-500">{rule.description}</p>
            </div>



            <div className="mt-8">
                <SpecializedRuleRunner rule={rule} />
            </div>
        </div>
    );
}
