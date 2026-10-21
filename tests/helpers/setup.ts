import { CONFIG_PATH_ENV_VAR } from "../../src/utils/constants";

// Sin color los asserts sobre el texto son deterministas, esté o no el output en TTY.
process.env.NO_COLOR = "1";

// Ningún test debe tocar el archivo de configuración real del usuario.
delete process.env[CONFIG_PATH_ENV_VAR];
