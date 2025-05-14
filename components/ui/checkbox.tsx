"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, ...props }, ref) => {
    const [checked, setChecked] = React.useState(props.defaultChecked || false)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked)
      if (props.onChange) {
        props.onChange(event)
      }
    }

    return (
      <div className="flex items-start space-x-2">
        <div className="relative flex h-5 items-center">
          <input
            type="checkbox"
            className="peer absolute h-4 w-4 cursor-pointer opacity-0"
            id={props.id}
            ref={ref}
            checked={props.checked !== undefined ? props.checked : checked}
            onChange={handleChange}
            {...props}
          />
          <div
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-sm border border-primary ring-offset-background peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              checked || props.checked ? "bg-primary text-primary-foreground" : "bg-background",
              className
            )}
          >
            {(checked || props.checked) && <Check className="h-3 w-3" />}
          </div>
        </div>
        {(label || description) && (
          <div className="grid gap-1.5 leading-none">
            {label && (
              <label
                htmlFor={props.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
