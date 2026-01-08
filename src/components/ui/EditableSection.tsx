import React from 'react';
import { Textarea } from './Textarea';

interface EditableSectionProps {
    title: string;
    value: string;
    onChange: (val: string) => void;
    rows?: number;
    disabled?: boolean;
    placeholder?: string;
}

export const EditableSection: React.FC<EditableSectionProps> = ({
    title,
    value,
    onChange,
    rows = 3,
    disabled = false,
    placeholder
}) => (
    <div className="w-full">
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            {title}
        </label>
        <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            disabled={disabled}
            placeholder={placeholder}
            className="bg-card border-border text-foreground focus:bg-accent/50 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
    </div>
);

interface EditableInputProps {
    title: string;
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
    placeholder?: string;
    type?: 'text' | 'number';
}

export const EditableInput: React.FC<EditableInputProps> = ({
    title,
    value,
    onChange,
    disabled = false,
    placeholder,
    type = 'text'
}) => (
    <div className="w-full">
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            {title}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-md bg-card border border-border text-foreground focus:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
        />
    </div>
);

interface EditableListProps {
    title: string;
    items: string[];
    onChange: (items: string[]) => void;
    disabled?: boolean;
    placeholder?: string;
}

export const EditableList: React.FC<EditableListProps> = ({
    title,
    items,
    onChange,
    disabled = false,
    placeholder = "Item 1, Item 2, Item 3"
}) => (
    <div className="w-full">
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            {title} <span className="font-normal text-muted-foreground/60">(separados por vírgula)</span>
        </label>
        <Textarea
            value={items.join(', ')}
            onChange={(e) => onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            rows={2}
            disabled={disabled}
            placeholder={placeholder}
            className="bg-card border-border text-foreground focus:bg-accent/50 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
    </div>
);
